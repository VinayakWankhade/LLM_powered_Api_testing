"""
Endpoint consistency checker between frontend and backend
"""

import os
import json
from typing import Dict, List, Set
import re

def extract_backend_routes() -> Set[str]:
    """Extract all backend routes from FastAPI routers"""
    routes = set()
    backend_path = os.path.join(os.path.dirname(__file__), '..', 'app', 'routers')
    
    for file in os.listdir(backend_path):
        if file.endswith('.py'):
            with open(os.path.join(backend_path, file), 'r') as f:
                content = f.read()
                
                # Find router prefixes
                prefix_match = re.search(r'prefix="([^"]+)"', content)
                prefix = prefix_match.group(1) if prefix_match else ''
                
                # Find all route decorators
                route_patterns = [
                    r'@router\.(get|post|put|delete|patch)\s*\(\s*["\']([^"\']+)["\']',
                    r'@app\.(get|post|put|delete|patch)\s*\(\s*["\']([^"\']+)["\']'
                ]
                
                for pattern in route_patterns:
                    matches = re.finditer(pattern, content)
                    for match in matches:
                        method, path = match.groups()
                        full_path = f"{prefix}{path}" if prefix else path
                        routes.add(f"{method.upper()} {full_path}")
    
    return routes

def extract_frontend_routes() -> Set[str]:
    """Extract all frontend API calls"""
    routes = set()
    frontend_path = os.path.join(os.path.dirname(__file__), '..', 'frontend', 'src')
    
    for root, _, files in os.walk(frontend_path):
        for file in files:
            if file.endswith(('.js', '.jsx', '.ts', '.tsx')):
                with open(os.path.join(root, file), 'r') as f:
                    content = f.read()
                    
                    # Find axios/fetch calls
                    api_patterns = [
                        r'api\.(get|post|put|delete|patch)\s*\(\s*["\']([^"\']+)["\']',
                        r'fetch\s*\(\s*["\']([^"\']+)["\']',
                        r'axios\.(get|post|put|delete|patch)\s*\(\s*["\']([^"\']+)["\']'
                    ]
                    
                    for pattern in api_patterns:
                        matches = re.finditer(pattern, content)
                        for match in matches:
                            if len(match.groups()) == 2:
                                method, path = match.groups()
                                routes.add(f"{method.upper()} {path}")
                            else:
                                path = match.group(1)
                                routes.add(f"* {path}")
    
    return routes

def check_route_consistency() -> Dict[str, List[str]]:
    """Check consistency between frontend and backend routes"""
    backend_routes = extract_backend_routes()
    frontend_routes = extract_frontend_routes()
    
    # Clean up routes for comparison
    clean_backend = {re.sub(r'{[^}]+}', '*', route) for route in backend_routes}
    clean_frontend = {re.sub(r':[a-zA-Z]+', '*', route) for route in frontend_routes}
    
    # Find mismatches
    frontend_missing = clean_backend - clean_frontend
    backend_missing = clean_frontend - clean_backend
    
    return {
        "frontend_missing": sorted(list(frontend_missing)),
        "backend_missing": sorted(list(backend_missing)),
        "backend_total": len(backend_routes),
        "frontend_total": len(frontend_routes)
    }

def generate_report():
    """Generate a detailed route consistency report"""
    results = check_route_consistency()
    
    report = {
        "timestamp": datetime.now().isoformat(),
        "summary": {
            "total_backend_routes": results["backend_total"],
            "total_frontend_routes": results["frontend_total"],
            "missing_in_frontend": len(results["frontend_missing"]),
            "missing_in_backend": len(results["backend_missing"])
        },
        "details": {
            "frontend_missing": results["frontend_missing"],
            "backend_missing": results["backend_missing"]
        }
    }
    
    # Save report
    report_path = os.path.join(os.path.dirname(__file__), 'route_consistency_report.json')
    with open(report_path, 'w') as f:
        json.dump(report, f, indent=2)
    
    return report

if __name__ == "__main__":
    from datetime import datetime
    report = generate_report()
    print(f"Route Consistency Report Generated: {len(report['details']['frontend_missing'])} frontend mismatches, {len(report['details']['backend_missing'])} backend mismatches")