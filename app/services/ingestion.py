from __future__ import annotations

from dataclasses import dataclass, asdict
from typing import Any, Dict, List, Optional
from pathlib import Path

from app.services.embeddings import EmbeddingService
from app.services.knowledge_base import KnowledgeBase
from app.services.log_parser import LogParser
from app.services.codebase_analyzer import CodebaseAnalyzer
from app.utils.io import load_yaml_or_json
from app.utils.chunking import split_into_chunks


@dataclass
class MetadataNode:
    endpoint: str
    method: str
    operation_id: Optional[str]
    parameters: List[Dict[str, Any]]
    request_schema: Dict[str, Any] | None
    responses: Dict[str, Any] | None
    description: str
    tags: List[str]

    def to_meta(self) -> Dict[str, Any]:
        # ChromaDB only allows str, int, float, bool in metadata
        return {
            "source": "spec",
            "endpoint": self.endpoint,
            "method": self.method,
            "operation_id": self.operation_id or "",
            "description": self.description,
            "parameter_count": len(self.parameters),
            "has_request_schema": self.request_schema is not None,
            "has_responses": self.responses is not None,
            "tag_count": len(self.tags)
        }


@dataclass
class DocChunk:
    text: str
    source: str
    role: str = "doc"

    def to_meta(self) -> Dict[str, Any]:
        return {"source": self.source, "role": self.role}


class IngestionService:
    def __init__(self, kb: KnowledgeBase, embedder: EmbeddingService) -> None:
        self.kb = kb
        self.embedder = embedder

    def ingest(
        self,
        spec_files: List[str],
        doc_files: List[str],
        logs: Optional[List[str]] = None,
        codebase_paths: Optional[List[str]] = None,
        raw_texts: Optional[List[str]] = None,
        metadata_list: Optional[List[Dict[str, Any]]] = None
    ) -> Dict[str, Any]:
        """Enhanced ingestion supporting specs, docs, logs, and codebase analysis."""
        result = {}
        
        # Process API specifications
        specs = [self.parse_spec(f) for f in spec_files]
        nodes: List[MetadataNode] = []
        for spec in specs:
            nodes.extend(self.extract_metadata(spec))
        
        # Process documentation
        chunks: List[DocChunk] = []
        for path in doc_files:
            try:
                with open(path, "r", encoding="utf-8") as fh:
                    text = fh.read()
            except FileNotFoundError:
                continue
            for part in split_into_chunks(text):
                chunks.append(DocChunk(text=part, source=path))
        
        # Process logs if provided
        log_entries = []
        if logs:
            log_parser = LogParser()
            for log_file in logs:
                entries = log_parser.parse_file(log_file)
                log_entries.extend(entries)
            
            # Index log entries
            if log_entries:
                self.index_log_entries(log_entries)
                result["log_entries"] = len(log_entries)
                result["usage_patterns"] = log_parser.get_usage_patterns()
        
        # Process codebase if provided
        code_endpoints = []
        code_comments = []
        if codebase_paths:
            analyzer = CodebaseAnalyzer()
            for path in codebase_paths:
                analysis_result = analyzer.analyze_directory(path, recursive=True)
                result[f"codebase_analysis_{Path(path).name}"] = analysis_result
            
            code_endpoints = analyzer.endpoints
            code_comments = analyzer.comments
            
            # Index codebase findings
            if code_endpoints:
                self.index_code_endpoints(code_endpoints)
                result["code_endpoints"] = len(code_endpoints)
            
            if code_comments:
                self.index_code_comments(code_comments)
                result["code_comments"] = len(code_comments)
        
        # Process raw texts if provided (for MERN scanner results)
        if raw_texts and metadata_list:
            self.index_raw_texts(raw_texts, metadata_list)
            result["raw_texts_indexed"] = len(raw_texts)
        
        # Index traditional spec and doc data
        self.index_metadata(nodes)
        self.index_doc_chunks(chunks)
        
        result.update({
            "spec_nodes": len(nodes),
            "doc_chunks": len(chunks)
        })
        
        return result

    def parse_spec(self, path: str) -> Dict[str, Any]:
        return load_yaml_or_json(path)

    def extract_metadata(self, spec: Dict[str, Any]) -> List[MetadataNode]:
        nodes: List[MetadataNode] = []
        paths = (spec or {}).get("paths", {})
        for endpoint, path_item in paths.items():
            for method, op in path_item.items():
                if method.lower() not in {"get", "post", "put", "delete", "patch", "options", "head"}:
                    continue
                node = MetadataNode(
                    endpoint=endpoint,
                    method=method.upper(),
                    operation_id=(op or {}).get("operationId"),
                    parameters=(op or {}).get("parameters", []),
                    request_schema=(op or {}).get("requestBody"),
                    responses=(op or {}).get("responses"),
                    description=(op or {}).get("description", ""),
                    tags=(op or {}).get("tags", []),
                )
                nodes.append(node)
        return nodes

    def index_metadata(self, nodes: List[MetadataNode]) -> None:
        if not nodes:
            return
        documents = [self.metadata_to_text(n) for n in nodes]
        vectors = self.embedder.embed(documents)
        ids = [n.operation_id or f"op::{n.method}::{n.endpoint}" for n in nodes]
        metadatas = [n.to_meta() for n in nodes]
        self.kb.add(ids=ids, documents=documents, embeddings=vectors, metadatas=metadatas)

    def index_doc_chunks(self, chunks: List[DocChunk]) -> None:
        if not chunks:
            return
        documents = [c.text for c in chunks]
        vectors = self.embedder.embed(documents)
        ids = [f"doc::{i}" for i in range(len(chunks))]
        metadatas = [c.to_meta() for c in chunks]
        self.kb.add(ids=ids, documents=documents, embeddings=vectors, metadatas=metadatas)

    def metadata_to_text(self, node: MetadataNode) -> str:
        params = ", ".join([p.get("name", "?") for p in (node.parameters or [])])
        return (
            f"Endpoint {node.method} {node.endpoint}. "
            f"Description: {node.description}. "
            f"Parameters: {params}. "
            f"Responses: {list((node.responses or {}).keys())}."
        )

    def index_log_entries(self, entries: List) -> None:
        """Index log entries into the knowledge base."""
        if not entries:
            return
        
        documents = [entry.to_text() for entry in entries]
        vectors = self.embedder.embed(documents)
        ids = [f"log::{entry.timestamp.isoformat()}::{entry.method}::{entry.endpoint}" for entry in entries]
        metadatas = [entry.to_meta() for entry in entries]
        
        self.kb.add(ids=ids, documents=documents, embeddings=vectors, metadatas=metadatas)

    def index_code_endpoints(self, endpoints: List) -> None:
        """Index code endpoints into the knowledge base."""
        if not endpoints:
            return
        
        documents = [endpoint.to_text() for endpoint in endpoints]
        vectors = self.embedder.embed(documents)
        ids = [f"code::{endpoint.file_path}::{endpoint.line_number}::{endpoint.function_name}" for endpoint in endpoints]
        metadatas = [endpoint.to_meta() for endpoint in endpoints]
        
        self.kb.add(ids=ids, documents=documents, embeddings=vectors, metadatas=metadatas)

    def index_code_comments(self, comments: List) -> None:
        """Index code comments into the knowledge base."""
        if not comments:
            return
        
        documents = [comment.to_text() for comment in comments]
        vectors = self.embedder.embed(documents)
        ids = [f"comment::{comment.file_path}::{comment.line_number}" for comment in comments]
        metadatas = [comment.to_meta() for comment in comments]
        
        self.kb.add(ids=ids, documents=documents, embeddings=vectors, metadatas=metadatas)

    def index_raw_texts(self, texts: List[str], metadatas: List[Dict[str, Any]]) -> None:
        """Index arbitrary raw texts with provided metadatas (for MERN scanner)."""
        if not texts:
            return
        
        vectors = self.embedder.embed(texts)
        ids = [f"raw::{i}" for i in range(len(texts))]
        # Ensure metadatas list length matches texts length
        if len(metadatas) != len(texts):
            # Pad or trim metadatas to match
            if len(metadatas) < len(texts):
                metadatas = metadatas + [metadatas[-1] if metadatas else {}] * (len(texts) - len(metadatas))
            else:
                metadatas = metadatas[:len(texts)]
        self.kb.add(ids=ids, documents=texts, embeddings=vectors, metadatas=metadatas)

