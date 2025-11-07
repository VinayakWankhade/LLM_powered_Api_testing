"""
Document Chunking and Ingestion pipeline for RAG implementation.
Handles chunking MERN app documentation, code, and test results for vector storage.
"""

from typing import List, Dict, Any, Optional, Generator, Tuple
import re
import json
import os
from datetime import datetime
from pathlib import Path
from dataclasses import dataclass, asdict
import hashlib


@dataclass
class DocumentChunk:
    """Represents a chunk of document content."""
    content: str
    metadata: Dict[str, Any]
    source_type: str  # 'code', 'docs', 'test_results', 'api_spec'
    chunk_id: str
    source_file: str
    chunk_index: int
    total_chunks: int
    parent_document_id: str


class DocumentIngestionPipeline:
    """Pipeline for chunking and preparing documents for RAG ingestion."""
    
    def __init__(self, max_chunk_size: int = 1000, overlap_size: int = 200):
        self.max_chunk_size = max_chunk_size
        self.overlap_size = overlap_size
        
        # File type processors
        self.processors = {
            '.js': self._process_javascript,
            '.jsx': self._process_javascript,
            '.ts': self._process_typescript,
            '.tsx': self._process_typescript,
            '.py': self._process_python,
            '.json': self._process_json,
            '.md': self._process_markdown,
            '.txt': self._process_text,
            '.yaml': self._process_yaml,
            '.yml': self._process_yaml
        }
    
    async def ingest_mern_application(self, app_path: str) -> List[DocumentChunk]:
        """Ingest complete MERN application for RAG."""
        app_path = Path(app_path)
        all_chunks = []
        
        if not app_path.exists():
            raise ValueError(f"Application path does not exist: {app_path}")
        
        # Process different types of files
        file_patterns = [
            ('**/*.js', 'javascript'),
            ('**/*.jsx', 'react'),
            ('**/*.ts', 'typescript'),
            ('**/*.tsx', 'react_typescript'),
            ('**/*.py', 'python'),
            ('**/*.json', 'config'),
            ('**/*.md', 'documentation'),
            ('**/*.txt', 'documentation'),
            ('**/*.yaml', 'config'),
            ('**/*.yml', 'config')
        ]
        
        for pattern, file_type in file_patterns:
            files = list(app_path.glob(pattern))
            for file_path in files:
                # Skip common directories that shouldn't be indexed
                if self._should_skip_file(file_path):
                    continue
                
                try:
                    chunks = await self._process_file(file_path, file_type)
                    all_chunks.extend(chunks)
                except Exception as e:
                    print(f"Error processing {file_path}: {e}")
                    continue
        
        return all_chunks
    
    def _should_skip_file(self, file_path: Path) -> bool:
        """Check if file should be skipped during ingestion."""
        skip_dirs = {
            'node_modules', '.git', '__pycache__', '.next', 'build', 
            'dist', '.vscode', '.idea', 'coverage', '.nyc_output'
        }
        
        skip_files = {
            '.env', '.env.local', '.env.development', '.env.production',
            'package-lock.json', 'yarn.lock', '.gitignore'
        }
        
        # Check if file is in skip directories
        for part in file_path.parts:
            if part in skip_dirs:
                return True
        
        # Check if filename should be skipped
        if file_path.name in skip_files:
            return True
        
        # Skip very large files (> 1MB)
        try:
            if file_path.stat().st_size > 1024 * 1024:
                return True
        except OSError:
            return True
        
        return False
    
    async def _process_file(self, file_path: Path, file_type: str) -> List[DocumentChunk]:
        """Process a single file and return chunks."""
        try:
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
        except Exception as e:
            print(f"Error reading {file_path}: {e}")
            return []
        
        if not content.strip():
            return []
        
        # Get appropriate processor
        processor = self.processors.get(file_path.suffix, self._process_text)
        
        # Generate document ID
        doc_id = self._generate_document_id(str(file_path), content)
        
        # Process content into chunks
        raw_chunks = processor(content, file_path)
        
        # Convert to DocumentChunk objects
        chunks = []
        for i, (chunk_content, metadata) in enumerate(raw_chunks):
            chunk_id = f"{doc_id}_chunk_{i}"
            
            # Add common metadata
            full_metadata = {
                'source_file': str(file_path),
                'file_type': file_type,
                'file_extension': file_path.suffix,
                'processing_timestamp': datetime.utcnow().isoformat(),
                'chunk_size': len(chunk_content),
                **metadata
            }
            
            chunk = DocumentChunk(
                content=chunk_content,
                metadata=full_metadata,
                source_type=self._determine_source_type(file_path, file_type),
                chunk_id=chunk_id,
                source_file=str(file_path),
                chunk_index=i,
                total_chunks=len(raw_chunks),
                parent_document_id=doc_id
            )
            
            chunks.append(chunk)
        
        return chunks
    
    def _generate_document_id(self, file_path: str, content: str) -> str:
        """Generate unique document ID."""
        content_hash = hashlib.md5(content.encode()).hexdigest()[:8]
        path_hash = hashlib.md5(file_path.encode()).hexdigest()[:6]
        timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
        return f"doc_{timestamp}_{path_hash}_{content_hash}"
    
    def _determine_source_type(self, file_path: Path, file_type: str) -> str:
        """Determine the source type of the document."""
        file_name = file_path.name.lower()
        parent_dir = file_path.parent.name.lower()
        
        # API specification files
        if 'api' in file_name or 'swagger' in file_name or 'openapi' in file_name:
            return 'api_spec'
        
        # Documentation
        if file_path.suffix in ['.md', '.txt'] or 'readme' in file_name or 'doc' in parent_dir:
            return 'docs'
        
        # Test files
        if 'test' in file_name or 'spec' in file_name or 'test' in parent_dir:
            return 'test_results'
        
        # Configuration files
        if file_path.suffix in ['.json', '.yaml', '.yml'] or 'config' in file_name:
            return 'config'
        
        # Code files
        return 'code'
    
    def _process_javascript(self, content: str, file_path: Path) -> List[Tuple[str, Dict[str, Any]]]:
        """Process JavaScript/JSX files."""
        chunks = []
        
        # Extract functions, classes, and components
        function_pattern = r'((?:export\s+)?(?:async\s+)?function\s+\w+[^{]*\{[^}]*\})'
        class_pattern = r'(class\s+\w+[^{]*\{[^}]*\})'
        component_pattern = r'(const\s+\w+\s*=\s*\([^)]*\)\s*=>\s*\{[^}]*\})'
        
        # Extract API endpoints if it's an Express route file
        if 'route' in file_path.name.lower() or 'api' in str(file_path):
            endpoint_pattern = r'(app\.(get|post|put|delete|patch)\s*\([^)]+\)[^}]*\})'
            endpoints = re.findall(endpoint_pattern, content, re.DOTALL | re.IGNORECASE)
            
            for endpoint_match, method in endpoints:
                chunks.append((endpoint_match, {
                    'type': 'api_endpoint',
                    'method': method.upper(),
                    'language': 'javascript'
                }))
        
        # Regular chunking for remaining content
        text_chunks = self._chunk_text(content)
        for chunk in text_chunks:
            chunks.append((chunk, {
                'type': 'code_block',
                'language': 'javascript',
                'file_type': 'js'
            }))
        
        return chunks
    
    def _process_typescript(self, content: str, file_path: Path) -> List[Tuple[str, Dict[str, Any]]]:
        """Process TypeScript/TSX files."""
        chunks = []
        
        # Extract interfaces and types
        interface_pattern = r'(interface\s+\w+[^{]*\{[^}]*\})'
        type_pattern = r'(type\s+\w+\s*=[^;]+;)'
        
        interfaces = re.findall(interface_pattern, content, re.DOTALL)
        types = re.findall(type_pattern, content, re.DOTALL)
        
        for interface in interfaces:
            chunks.append((interface, {
                'type': 'interface',
                'language': 'typescript'
            }))
        
        for type_def in types:
            chunks.append((type_def, {
                'type': 'type_definition',
                'language': 'typescript'
            }))
        
        # Regular chunking for remaining content
        text_chunks = self._chunk_text(content)
        for chunk in text_chunks:
            chunks.append((chunk, {
                'type': 'code_block',
                'language': 'typescript'
            }))
        
        return chunks
    
    def _process_python(self, content: str, file_path: Path) -> List[Tuple[str, Dict[str, Any]]]:
        """Process Python files."""
        chunks = []
        
        # Extract FastAPI routes
        if 'router' in file_path.name.lower() or 'main' in file_path.name.lower():
            route_pattern = r'(@app\.(get|post|put|delete|patch)\([^)]+\)[^}]*?def\s+\w+[^:]*:[^}]*?)(?=@|\Z)'
            routes = re.findall(route_pattern, content, re.DOTALL | re.IGNORECASE)
            
            for route_match, method in routes:
                chunks.append((route_match, {
                    'type': 'api_endpoint',
                    'method': method.upper(),
                    'language': 'python',
                    'framework': 'fastapi'
                }))
        
        # Regular chunking
        text_chunks = self._chunk_text(content)
        for chunk in text_chunks:
            chunks.append((chunk, {
                'type': 'code_block',
                'language': 'python'
            }))
        
        return chunks
    
    def _process_json(self, content: str, file_path: Path) -> List[Tuple[str, Dict[str, Any]]]:
        """Process JSON files."""
        chunks = []
        
        try:
            json_data = json.loads(content)
            
            # Handle package.json
            if file_path.name == 'package.json':
                if 'scripts' in json_data:
                    chunks.append((json.dumps(json_data['scripts'], indent=2), {
                        'type': 'package_scripts',
                        'format': 'json'
                    }))
                
                if 'dependencies' in json_data:
                    chunks.append((json.dumps(json_data['dependencies'], indent=2), {
                        'type': 'dependencies',
                        'format': 'json'
                    }))
            
            # Handle OpenAPI/Swagger specs
            elif 'openapi' in json_data or 'swagger' in json_data:
                if 'paths' in json_data:
                    chunks.append((json.dumps(json_data['paths'], indent=2), {
                        'type': 'api_paths',
                        'format': 'openapi'
                    }))
            
            # General JSON chunking
            else:
                text_chunks = self._chunk_text(content)
                for chunk in text_chunks:
                    chunks.append((chunk, {
                        'type': 'config',
                        'format': 'json'
                    }))
        
        except json.JSONDecodeError:
            # Fallback to text processing
            text_chunks = self._chunk_text(content)
            for chunk in text_chunks:
                chunks.append((chunk, {
                    'type': 'malformed_json',
                    'format': 'text'
                }))
        
        return chunks
    
    def _process_markdown(self, content: str, file_path: Path) -> List[Tuple[str, Dict[str, Any]]]:
        """Process Markdown files."""
        chunks = []
        
        # Split by headers
        sections = re.split(r'\n(?=#+\s)', content)
        
        for section in sections:
            if section.strip():
                # Extract header level
                header_match = re.match(r'^(#+)\s+(.+)', section)
                header_level = len(header_match.group(1)) if header_match else 0
                header_text = header_match.group(2) if header_match else "Content"
                
                chunks.append((section.strip(), {
                    'type': 'documentation_section',
                    'format': 'markdown',
                    'header_level': header_level,
                    'header_text': header_text
                }))
        
        return chunks
    
    def _process_text(self, content: str, file_path: Path) -> List[Tuple[str, Dict[str, Any]]]:
        """Process plain text files."""
        text_chunks = self._chunk_text(content)
        return [(chunk, {'type': 'text', 'format': 'plain'}) for chunk in text_chunks]
    
    def _process_yaml(self, content: str, file_path: Path) -> List[Tuple[str, Dict[str, Any]]]:
        """Process YAML files."""
        text_chunks = self._chunk_text(content)
        return [(chunk, {'type': 'config', 'format': 'yaml'}) for chunk in text_chunks]
    
    def _chunk_text(self, text: str) -> List[str]:
        """Chunk text into manageable pieces with overlap."""
        if len(text) <= self.max_chunk_size:
            return [text]
        
        chunks = []
        start = 0
        
        while start < len(text):
            end = start + self.max_chunk_size
            
            # Try to break at sentence boundaries
            if end < len(text):
                # Look for sentence endings
                sentence_end = max(
                    text.rfind('.', start, end),
                    text.rfind('!', start, end),
                    text.rfind('?', start, end),
                    text.rfind('\n\n', start, end)
                )
                
                if sentence_end > start + self.max_chunk_size // 2:
                    end = sentence_end + 1
                else:
                    # Fallback to word boundaries
                    word_boundary = text.rfind(' ', start, end)
                    if word_boundary > start + self.max_chunk_size // 2:
                        end = word_boundary
            
            chunk = text[start:end].strip()
            if chunk:
                chunks.append(chunk)
            
            # Move start position with overlap
            start = max(start + 1, end - self.overlap_size)
        
        return chunks
    
    async def ingest_test_results(self, test_results: Dict[str, Any]) -> List[DocumentChunk]:
        """Ingest test execution results for RAG."""
        chunks = []
        doc_id = self._generate_document_id("test_results", json.dumps(test_results))
        
        # Process different parts of test results
        if 'test_cases' in test_results:
            for i, test_case in enumerate(test_results['test_cases']):
                chunk_content = json.dumps(test_case, indent=2)
                chunk_id = f"{doc_id}_test_case_{i}"
                
                chunk = DocumentChunk(
                    content=chunk_content,
                    metadata={
                        'type': 'test_case',
                        'test_id': test_case.get('test_id', f'test_{i}'),
                        'test_type': test_case.get('type', 'unknown'),
                        'status': test_case.get('status', 'unknown'),
                        'endpoint': test_case.get('endpoint', ''),
                        'method': test_case.get('method', ''),
                        'processing_timestamp': datetime.utcnow().isoformat()
                    },
                    source_type='test_results',
                    chunk_id=chunk_id,
                    source_file='test_execution_results.json',
                    chunk_index=i,
                    total_chunks=len(test_results['test_cases']),
                    parent_document_id=doc_id
                )
                
                chunks.append(chunk)
        
        # Process coverage information
        if 'coverage' in test_results:
            coverage_content = json.dumps(test_results['coverage'], indent=2)
            chunk_id = f"{doc_id}_coverage"
            
            chunk = DocumentChunk(
                content=coverage_content,
                metadata={
                    'type': 'coverage_report',
                    'coverage_percentage': test_results['coverage'].get('percentage', 0),
                    'processing_timestamp': datetime.utcnow().isoformat()
                },
                source_type='test_results',
                chunk_id=chunk_id,
                source_file='coverage_report.json',
                chunk_index=0,
                total_chunks=1,
                parent_document_id=doc_id
            )
            
            chunks.append(chunk)
        
        return chunks
    
    def chunks_to_knowledge_base_format(self, chunks: List[DocumentChunk]) -> List[Dict[str, Any]]:
        """Convert DocumentChunk objects to knowledge base format."""
        return [
            {
                'content': chunk.content,
                'metadata': {
                    **chunk.metadata,
                    'chunk_id': chunk.chunk_id,
                    'source_type': chunk.source_type,
                    'source_file': chunk.source_file,
                    'chunk_index': chunk.chunk_index,
                    'total_chunks': chunk.total_chunks,
                    'parent_document_id': chunk.parent_document_id
                }
            }
            for chunk in chunks
        ]