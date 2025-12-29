import os
import re
from typing import List, Dict
from app.models.endpoint import Endpoint

class CodeScanner:
    """
    Scans a directory for API endpoint definitions.
    Supports Express (JS/TS) and FastAPI (Python) patterns.
    """
    
    # Patterns for Express.js: app.get('/path', ...) or router.post('/path', ...)
    EXPRESS_PATTERN = re.compile(
        r'(?:app|router|auth)\.(get|post|put|delete|patch)\s*\(\s*[\'"]([^\'"]+)[\'"]', 
        re.IGNORECASE
    )
    
    # Patterns for FastAPI: @router.get("/path") or @app.post("/path")
    FASTAPI_PATTERN = re.compile(
        r'@(?:app|router|api_router)\.(get|post|put|delete|patch)\s*\(\s*[\'"]([^\'"]+)[\'"]', 
        re.IGNORECASE
    )

    def scan_directory(self, directory_path: str) -> List[Dict]:
        endpoints = []
        
        if not os.path.exists(directory_path):
            print(f"Directory not found: {directory_path}")
            return endpoints

        for root, _, files in os.walk(directory_path):
            # Skip node_modules, .git, venv
            if any(part in root.split(os.sep) for part in ['node_modules', '.git', 'venv', '__pycache__']):
                continue
                
            for file in files:
                if file.endswith(('.js', '.ts', '.py')):
                    file_path = os.path.join(root, file)
                    endpoints.extend(self._scan_file(file_path))
        
        # Deduplication
        unique_endpoints = []
        seen = set()
        for e in endpoints:
            key = (e['method'], e['path'])
            if key not in seen:
                unique_endpoints.append(e)
                seen.add(key)
                
        return unique_endpoints

    def _scan_file(self, file_path: str) -> List[Dict]:
        found = []
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
                
                # Scan Express patterns
                for match in self.EXPRESS_PATTERN.finditer(content):
                    method, path = match.groups()
                    found.append({
                        "method": method.upper(),
                        "path": path,
                        "file": file_path
                    })
                
                # Scan FastAPI patterns
                for match in self.FASTAPI_PATTERN.finditer(content):
                    method, path = match.groups()
                    found.append({
                        "method": method.upper(),
                        "path": path,
                        "file": file_path
                    })
        except Exception as e:
            print(f"Error scanning {file_path}: {e}")
            
        return found

scanner = CodeScanner()
