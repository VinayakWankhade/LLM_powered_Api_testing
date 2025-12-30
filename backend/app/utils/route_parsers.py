import re
from typing import List, Dict

class RouteParsers:
    """
    The 'Eyes' of the scanner. 
    Uses Regular Expressions (Regex) to detect API routes in code.
    
    Why this?
    Regex allows us to find specific patterns (like @app.get) 
    without needing a full complex code analyzer.
    """
    
    # 1. FastAPI Regex (Python)
    # Looks for: @router.get("/path"), @app.post("/path"), etc.
    FASTAPI_REGEX = r'@(?:router|app)\.(get|post|put|delete|patch|options)\s*\(\s*["\']([^"\']+)["\']'
    
    # 2. Express Regex (JS/TS)
    # Looks for: router.get('/path'), app.post("/path"), etc.
    EXPRESS_REGEX = r'(?:app|router|route)\.(get|post|put|delete|patch|options)\s*\(\s*["\']([^"\']+)["\']'

    @staticmethod
    def parse_fastapi(content: str) -> List[Dict[str, str]]:
        """Finds all FastAPI routes in a string of code."""
        matches = re.findall(RouteParsers.FASTAPI_REGEX, content, re.IGNORECASE)
        return [
            {"method": method.upper(), "path": path, "framework": "FASTAPI"} 
            for method, path in matches
        ]

    @staticmethod
    def parse_express(content: str) -> List[Dict[str, str]]:
        """Finds all Express routes in a string of code."""
        matches = re.findall(RouteParsers.EXPRESS_REGEX, content, re.IGNORECASE)
        return [
            {"method": method.upper(), "path": path, "framework": "EXPRESS"} 
            for method, path in matches
        ]

    @staticmethod
    def detect_endpoints(file_path: str) -> List[Dict[str, str]]:
        """
        Reads a file and detects endpoints based on its extension.
        """
        if not file_path.endswith(('.py', '.js', '.ts')):
            return []
            
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
                
            if file_path.endswith('.py'):
                return RouteParsers.parse_fastapi(content)
            else:
                return RouteParsers.parse_express(content)
        except Exception:
            return []
