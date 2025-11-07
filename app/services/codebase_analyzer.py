"""
Codebase analyzer for extracting API endpoints, comments, and metadata from source code.
Supports multiple programming languages and frameworks.
"""

import ast
import re
from dataclasses import dataclass, asdict
from pathlib import Path
from typing import Any, Dict, List, Optional, Set, Union


@dataclass
class EndpointInfo:
    """Information about an API endpoint found in source code."""
    path: str
    method: str
    function_name: str
    file_path: str
    line_number: int
    docstring: Optional[str]
    parameters: List[Dict[str, Any]]
    decorators: List[str]
    comments: List[str]
    
    def to_meta(self) -> Dict[str, Any]:
        """Convert to metadata for knowledge base storage."""
        return {
            "source": "codebase",
            "type": "endpoint",
            "path": self.path,
            "method": self.method,
            "function_name": self.function_name,
            "file_path": self.file_path,
            "line_number": self.line_number,
            "has_docstring": self.docstring is not None,
            "parameter_count": len(self.parameters),
            "decorator_count": len(self.decorators)
        }
    
    def to_text(self) -> str:
        """Convert to text representation for embedding."""
        parts = [
            f"API endpoint {self.method} {self.path}",
            f"Function: {self.function_name}",
            f"File: {self.file_path}:{self.line_number}"
        ]
        
        if self.docstring:
            parts.append(f"Description: {self.docstring}")
        
        if self.parameters:
            param_names = [p.get('name', '') for p in self.parameters]
            parts.append(f"Parameters: {', '.join(param_names)}")
        
        if self.comments:
            parts.append(f"Comments: {' '.join(self.comments)}")
        
        return ". ".join(parts)


@dataclass
class CodeComment:
    """A comment found in source code."""
    text: str
    file_path: str
    line_number: int
    context: str  # surrounding code context
    comment_type: str  # TODO, FIXME, NOTE, etc.
    
    def to_meta(self) -> Dict[str, Any]:
        return {
            "source": "codebase",
            "type": "comment",
            "file_path": self.file_path,
            "line_number": self.line_number,
            "comment_type": self.comment_type
        }
    
    def to_text(self) -> str:
        return f"Code comment in {self.file_path}:{self.line_number}: {self.text}. Context: {self.context}"


class CodebaseAnalyzer:
    """Analyzer for extracting API-related information from source code."""
    
    # Common API framework patterns
    FASTAPI_PATTERNS = [
        re.compile(r'@app\.(get|post|put|delete|patch|options|head)\s*\(\s*["\']([^"\']+)["\']'),
        re.compile(r'@router\.(get|post|put|delete|patch|options|head)\s*\(\s*["\']([^"\']+)["\']'),
    ]
    
    FLASK_PATTERNS = [
        re.compile(r'@app\.route\s*\(\s*["\']([^"\']+)["\'].*?methods\s*=\s*\[([^\]]+)\]'),
        re.compile(r'@bp\.route\s*\(\s*["\']([^"\']+)["\'].*?methods\s*=\s*\[([^\]]+)\]'),
    ]
    
    DJANGO_PATTERNS = [
        re.compile(r'path\s*\(\s*["\']([^"\']+)["\']'),
        re.compile(r'url\s*\(\s*r?["\']([^"\']+)["\']'),
    ]
    
    # Comment patterns
    COMMENT_PATTERNS = {
        'TODO': re.compile(r'#\s*TODO:?\s*(.+)', re.IGNORECASE),
        'FIXME': re.compile(r'#\s*FIXME:?\s*(.+)', re.IGNORECASE),
        'NOTE': re.compile(r'#\s*NOTE:?\s*(.+)', re.IGNORECASE),
        'BUG': re.compile(r'#\s*BUG:?\s*(.+)', re.IGNORECASE),
        'HACK': re.compile(r'#\s*HACK:?\s*(.+)', re.IGNORECASE),
        'GENERAL': re.compile(r'#\s*(.+)'),
    }
    
    def __init__(self):
        self.endpoints: List[EndpointInfo] = []
        self.comments: List[CodeComment] = []
        self.supported_extensions = {'.py', '.js', '.ts', '.java', '.go', '.rb'}
    
    def analyze_directory(self, directory: Union[str, Path], recursive: bool = True) -> Dict[str, Any]:
        """Analyze a directory for API endpoints and comments."""
        path = Path(directory)
        if not path.exists():
            return {"error": f"Directory {directory} does not exist"}
        
        files_analyzed = 0
        for file_path in self._get_source_files(path, recursive):
            try:
                self.analyze_file(file_path)
                files_analyzed += 1
            except Exception as e:
                print(f"Error analyzing {file_path}: {e}")
        
        return {
            "files_analyzed": files_analyzed,
            "endpoints_found": len(self.endpoints),
            "comments_found": len(self.comments),
            "unique_paths": len(set(ep.path for ep in self.endpoints)),
            "frameworks_detected": self._detect_frameworks()
        }
    
    def analyze_file(self, file_path: Union[str, Path]) -> None:
        """Analyze a single source file."""
        path = Path(file_path)
        if not path.exists() or path.suffix not in self.supported_extensions:
            return
        
        try:
            content = path.read_text(encoding='utf-8')
            lines = content.split('\n')
            
            if path.suffix == '.py':
                self._analyze_python_file(path, content, lines)
            else:
                self._analyze_generic_file(path, content, lines)
                
        except Exception as e:
            print(f"Error reading {file_path}: {e}")
    
    def _analyze_python_file(self, file_path: Path, content: str, lines: List[str]) -> None:
        """Analyze Python file using AST and regex patterns."""
        # Use AST for structured analysis
        try:
            tree = ast.parse(content)
            self._extract_python_endpoints(tree, file_path, lines)
        except SyntaxError:
            # Fallback to regex if AST parsing fails
            pass
        
        # Extract endpoints using regex patterns
        self._extract_endpoints_regex(file_path, content, lines)
        
        # Extract comments
        self._extract_comments(file_path, lines)
    
    def _analyze_generic_file(self, file_path: Path, content: str, lines: List[str]) -> None:
        """Analyze non-Python files using regex patterns."""
        self._extract_endpoints_regex(file_path, content, lines)
        self._extract_comments(file_path, lines)
    
    def _extract_python_endpoints(self, tree: ast.AST, file_path: Path, lines: List[str]) -> None:
        """Extract endpoints from Python AST."""
        for node in ast.walk(tree):
            if isinstance(node, ast.FunctionDef):
                # Check for API decorators
                for decorator in node.decorator_list:
                    endpoint_info = self._parse_python_decorator(decorator, node, file_path, lines)
                    if endpoint_info:
                        self.endpoints.append(endpoint_info)
    
    def _parse_python_decorator(self, decorator: ast.AST, func_node: ast.FunctionDef, 
                               file_path: Path, lines: List[str]) -> Optional[EndpointInfo]:
        """Parse Python decorator to extract endpoint information."""
        try:
            # Handle @app.get("/path") style decorators
            if isinstance(decorator, ast.Attribute):
                if hasattr(decorator.value, 'id') and decorator.value.id in ['app', 'router']:
                    method = decorator.attr.upper()
                    # Look for the path in the decorator call
                    # This is a simplified version - full AST parsing would be more complex
                    return None
            
            # Handle @route("/path", methods=["GET"]) style decorators
            elif isinstance(decorator, ast.Call):
                if hasattr(decorator.func, 'attr') and decorator.func.attr == 'route':
                    # Extract path and methods from decorator arguments
                    path = None
                    methods = ['GET']  # default
                    
                    if decorator.args and isinstance(decorator.args[0], ast.Constant):
                        path = decorator.args[0].value
                    
                    # Look for methods in keywords
                    for keyword in decorator.keywords:
                        if keyword.arg == 'methods':
                            if isinstance(keyword.value, ast.List):
                                methods = [elt.value for elt in keyword.value 
                                         if isinstance(elt, ast.Constant)]
                    
                    if path:
                        # Get function docstring
                        docstring = ast.get_docstring(func_node)
                        
                        # Get function parameters
                        parameters = []
                        for arg in func_node.args.args:
                            parameters.append({"name": arg.arg, "type": None})
                        
                        # Create endpoint info for each method
                        for method in methods:
                            endpoint = EndpointInfo(
                                path=path,
                                method=method.upper(),
                                function_name=func_node.name,
                                file_path=str(file_path),
                                line_number=func_node.lineno,
                                docstring=docstring,
                                parameters=parameters,
                                decorators=[ast.unparse(decorator) if hasattr(ast, 'unparse') else str(decorator)],
                                comments=[]
                            )
                            return endpoint
        
        except Exception:
            pass
        
        return None
    
    def _extract_endpoints_regex(self, file_path: Path, content: str, lines: List[str]) -> None:
        """Extract endpoints using regex patterns."""
        # FastAPI patterns
        for pattern in self.FASTAPI_PATTERNS:
            for match in pattern.finditer(content):
                method = match.group(1).upper()
                path = match.group(2)
                line_num = content[:match.start()].count('\n') + 1
                
                # Find the function name (look for def on following lines)
                func_name = self._find_function_name(lines, line_num)
                
                endpoint = EndpointInfo(
                    path=path,
                    method=method,
                    function_name=func_name or "unknown",
                    file_path=str(file_path),
                    line_number=line_num,
                    docstring=None,
                    parameters=[],
                    decorators=[match.group(0)],
                    comments=[]
                )
                self.endpoints.append(endpoint)
        
        # Flask patterns
        for pattern in self.FLASK_PATTERNS:
            for match in pattern.finditer(content):
                path = match.group(1)
                methods_str = match.group(2)
                methods = [m.strip().strip('"\'') for m in methods_str.split(',')]
                line_num = content[:match.start()].count('\n') + 1
                
                func_name = self._find_function_name(lines, line_num)
                
                for method in methods:
                    endpoint = EndpointInfo(
                        path=path,
                        method=method.upper(),
                        function_name=func_name or "unknown",
                        file_path=str(file_path),
                        line_number=line_num,
                        docstring=None,
                        parameters=[],
                        decorators=[match.group(0)],
                        comments=[]
                    )
                    self.endpoints.append(endpoint)
    
    def _extract_comments(self, file_path: Path, lines: List[str]) -> None:
        """Extract comments from source code."""
        for line_num, line in enumerate(lines, 1):
            for comment_type, pattern in self.COMMENT_PATTERNS.items():
                match = pattern.search(line)
                if match:
                    comment_text = match.group(1) if match.groups() else match.group(0)
                    
                    # Get context (surrounding lines)
                    context_lines = []
                    for i in range(max(0, line_num - 3), min(len(lines), line_num + 2)):
                        if i != line_num - 1:  # Don't include the comment line itself
                            context_lines.append(lines[i].strip())
                    
                    comment = CodeComment(
                        text=comment_text.strip(),
                        file_path=str(file_path),
                        line_number=line_num,
                        context=" ".join(context_lines),
                        comment_type=comment_type
                    )
                    self.comments.append(comment)
                    break  # Only match first pattern per line
    
    def _find_function_name(self, lines: List[str], start_line: int) -> Optional[str]:
        """Find the function name following a decorator."""
        for i in range(start_line, min(len(lines), start_line + 5)):
            line = lines[i].strip()
            if line.startswith('def '):
                match = re.match(r'def\s+(\w+)', line)
                if match:
                    return match.group(1)
        return None
    
    def _get_source_files(self, directory: Path, recursive: bool) -> List[Path]:
        """Get all source files in directory."""
        files = []
        
        if recursive:
            for ext in self.supported_extensions:
                files.extend(directory.rglob(f"*{ext}"))
        else:
            for ext in self.supported_extensions:
                files.extend(directory.glob(f"*{ext}"))
        
        # Filter out common non-source directories
        excluded_dirs = {'.git', '__pycache__', 'node_modules', '.venv', 'venv', 'build', 'dist'}
        return [f for f in files if not any(part in excluded_dirs for part in f.parts)]
    
    def _detect_frameworks(self) -> List[str]:
        """Detect which frameworks are being used based on found endpoints."""
        frameworks = set()
        
        for endpoint in self.endpoints:
            for decorator in endpoint.decorators:
                if '@app.' in decorator or '@router.' in decorator:
                    frameworks.add('FastAPI')
                elif '@app.route' in decorator or '@bp.route' in decorator:
                    frameworks.add('Flask')
                elif 'path(' in decorator or 'url(' in decorator:
                    frameworks.add('Django')
        
        return list(frameworks)
    
    def get_endpoint_summary(self) -> Dict[str, Any]:
        """Get summary statistics about found endpoints."""
        if not self.endpoints:
            return {}
        
        methods = {}
        paths = set()
        files = set()
        
        for endpoint in self.endpoints:
            methods[endpoint.method] = methods.get(endpoint.method, 0) + 1
            paths.add(endpoint.path)
            files.add(endpoint.file_path)
        
        return {
            "total_endpoints": len(self.endpoints),
            "unique_paths": len(paths),
            "files_with_endpoints": len(files),
            "methods": methods,
            "frameworks": self._detect_frameworks()
        }
    
    def get_comment_summary(self) -> Dict[str, Any]:
        """Get summary statistics about found comments."""
        if not self.comments:
            return {}
        
        types = {}
        files = set()
        
        for comment in self.comments:
            types[comment.comment_type] = types.get(comment.comment_type, 0) + 1
            files.add(comment.file_path)
        
        return {
            "total_comments": len(self.comments),
            "files_with_comments": len(files),
            "comment_types": types
        }