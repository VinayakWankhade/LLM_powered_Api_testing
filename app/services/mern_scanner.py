"""
Enhanced MERN Application Scanner
Specifically designed to analyze MERN (MongoDB, Express, React, Node) applications
and extract comprehensive API information following the workflow diagram.
"""

import ast
import json
import re
import os
from dataclasses import dataclass, asdict
from pathlib import Path
from typing import Any, Dict, List, Optional, Set, Union, Tuple
import logging
from datetime import datetime


@dataclass
class MERNEndpoint:
    """Enhanced endpoint information for MERN applications."""
    path: str
    method: str
    function_name: str
    file_path: str
    line_number: int
    framework: str  # Express, FastAPI, Flask, etc.
    middleware: List[str]
    authentication: Optional[str]
    validation_schema: Optional[Dict[str, Any]]
    response_schema: Optional[Dict[str, Any]]
    database_models: List[str]
    parameters: List[Dict[str, Any]]
    headers: List[str]
    dependencies: List[str]
    docstring: Optional[str]
    comments: List[str]
    security_annotations: List[str]
    
    def to_meta(self) -> Dict[str, Any]:
        """Convert to metadata for knowledge base storage."""
        return {
            "source": "mern_codebase",
            "type": "endpoint",
            "path": self.path,
            "method": self.method,
            "framework": self.framework,
            "function_name": self.function_name,
            "file_path": self.file_path,
            "line_number": self.line_number,
            "has_auth": self.authentication is not None,
            "has_validation": self.validation_schema is not None,
            "middleware_count": len(self.middleware),
            "parameter_count": len(self.parameters),
            "database_models": self.database_models,
            "security_level": len(self.security_annotations)
        }
    
    def to_text(self) -> str:
        """Convert to comprehensive text representation for embedding."""
        parts = [
            f"{self.framework} API endpoint {self.method} {self.path}",
            f"Function: {self.function_name} in {self.file_path}:{self.line_number}"
        ]
        
        if self.docstring:
            parts.append(f"Description: {self.docstring}")
        
        if self.authentication:
            parts.append(f"Authentication: {self.authentication}")
        
        if self.middleware:
            parts.append(f"Middleware: {', '.join(self.middleware)}")
        
        if self.parameters:
            param_info = []
            for p in self.parameters:
                param_str = f"{p.get('name', 'unknown')}"
                if p.get('type'):
                    param_str += f" ({p['type']})"
                if p.get('required'):
                    param_str += " [required]"
                param_info.append(param_str)
            parts.append(f"Parameters: {', '.join(param_info)}")
        
        if self.database_models:
            parts.append(f"Database Models: {', '.join(self.database_models)}")
        
        if self.validation_schema:
            parts.append(f"Request validation: {json.dumps(self.validation_schema, indent=None)}")
        
        if self.response_schema:
            parts.append(f"Response schema: {json.dumps(self.response_schema, indent=None)}")
        
        if self.security_annotations:
            parts.append(f"Security: {', '.join(self.security_annotations)}")
        
        if self.comments:
            parts.append(f"Comments: {' '.join(self.comments)}")
        
        return ". ".join(parts)


@dataclass
class MERNComponent:
    """MERN application component (Model, Route, Controller, etc.)."""
    name: str
    type: str  # model, route, controller, middleware, etc.
    file_path: str
    dependencies: List[str]
    exports: List[str]
    database_collections: List[str]
    api_endpoints: List[str]
    
    def to_meta(self) -> Dict[str, Any]:
        return {
            "source": "mern_codebase",
            "type": "component",
            "component_type": self.type,
            "name": self.name,
            "file_path": self.file_path,
            "dependency_count": len(self.dependencies),
            "export_count": len(self.exports),
            "database_collections": self.database_collections,
            "api_endpoints": self.api_endpoints
        }
    
    def to_text(self) -> str:
        parts = [
            f"MERN {self.type} component: {self.name}",
            f"File: {self.file_path}"
        ]
        
        if self.dependencies:
            parts.append(f"Dependencies: {', '.join(self.dependencies)}")
        
        if self.exports:
            parts.append(f"Exports: {', '.join(self.exports)}")
        
        if self.database_collections:
            parts.append(f"Database collections: {', '.join(self.database_collections)}")
        
        if self.api_endpoints:
            parts.append(f"Related endpoints: {', '.join(self.api_endpoints)}")
        
        return ". ".join(parts)


class MERNScanner:
    """Enhanced MERN application scanner with comprehensive analysis capabilities."""
    
    # Express.js patterns
    EXPRESS_PATTERNS = [
        # app.get('/path', handler)
        re.compile(r'(?:app|router)\.(get|post|put|delete|patch|options|head)\s*\(\s*["\']([^"\']+)["\']'),
        # app.use('/path', router)
        re.compile(r'(?:app|router)\.use\s*\(\s*["\']([^"\']+)["\']'),
        # router.route('/path').get().post()
        re.compile(r'(?:app|router)\.route\s*\(\s*["\']([^"\']+)["\']'),
    ]
    
    # Middleware patterns
    MIDDLEWARE_PATTERNS = [
        re.compile(r'app\.use\s*\(\s*([^)]+)\)'),
        re.compile(r'router\.use\s*\(\s*([^)]+)\)'),
        re.compile(r'\.use\s*\(\s*([^)]+)\)'),
    ]
    
    # Authentication patterns
    AUTH_PATTERNS = [
        re.compile(r'passport\.(authenticate|use)'),
        re.compile(r'jwt\.(sign|verify)'),
        re.compile(r'bcrypt\.(hash|compare)'),
        re.compile(r'@auth|@authenticated|requireAuth|isAuthenticated'),
    ]
    
    # Database model patterns
    DB_MODEL_PATTERNS = [
        # Mongoose models
        re.compile(r'mongoose\.model\s*\(\s*["\']([^"\']+)["\']'),
        re.compile(r'Schema\s*\(\s*\{([^}]+)\}'),
        # MongoDB collections
        re.compile(r'db\.collection\s*\(\s*["\']([^"\']+)["\']'),
        re.compile(r'\.collection\s*\(\s*["\']([^"\']+)["\']'),
    ]
    
    # Validation patterns
    VALIDATION_PATTERNS = [
        re.compile(r'Joi\.object\s*\(\s*\{([^}]+)\}'),
        re.compile(r'yup\.object\s*\(\s*\{([^}]+)\}'),
        re.compile(r'@IsString|@IsNumber|@IsEmail|@IsOptional'),
        re.compile(r'validator\.[a-zA-Z]+'),
    ]
    
    def __init__(self):
        self.endpoints: List[MERNEndpoint] = []
        self.components: List[MERNComponent] = []
        self.dependencies: Dict[str, List[str]] = {}
        self.database_schemas: Dict[str, Dict[str, Any]] = {}
        self.logger = logging.getLogger(__name__)
    
    async def scan_mern_application(self, root_path: Union[str, Path], 
                                 api_running_url: Optional[str] = None) -> Dict[str, Any]:
        """
        Comprehensive MERN application analysis following the workflow diagram.
        
        Phases:
        1. Codebase Scanner - Analyze directory structure and files
        2. Extract Endpoints - Find all API endpoints and routes
        3. Component Discovery - Identify models, controllers, middleware
        4. API Service Detection - Check if API is running
        
        Args:
            root_path: Path to MERN application root
            api_running_url: URL to check if API service is running
            
        Returns:
            Comprehensive analysis results
        """
        path = Path(root_path)
        if not path.exists():
            raise ValueError(f"MERN application path does not exist: {root_path}")
        
        self.logger.info(f"Starting MERN application scan: {root_path}")
        
        analysis_start = datetime.now()
        
        # Phase 1: Codebase Scanner
        self.logger.info("Phase 1: Codebase Structure Analysis")
        structure_analysis = self._analyze_project_structure(path)
        
        # Phase 2: Extract Endpoints
        self.logger.info("Phase 2: API Endpoint Extraction")
        self._extract_endpoints_from_codebase(path)
        
        # Phase 3: Component Discovery
        self.logger.info("Phase 3: Component Discovery")
        self._discover_mern_components(path)
        
        # Phase 4: API Service Detection
        self.logger.info("Phase 4: API Service Detection")
        api_status = None
        if api_running_url:
            try:
                import asyncio
                api_status = await self._check_api_service_status(api_running_url)
            except Exception as e:
                self.logger.warning(f"API status check failed: {e}")
                api_status = {"is_running": False, "error": str(e)}
        
        analysis_time = (datetime.now() - analysis_start).total_seconds()
        
        # Compile comprehensive results
        results = {
            "scan_metadata": {
                "scan_time": analysis_time,
                "scanned_path": str(path.absolute()),
                "total_files_analyzed": structure_analysis["total_files"],
                "mern_stack_detected": structure_analysis["mern_components"]
            },
            "project_structure": structure_analysis,
            "endpoints": [endpoint.__dict__ for endpoint in self.endpoints],
            "components": [component.__dict__ for component in self.components],
            "api_service_status": api_status,
            "summary": {
                "endpoints_discovered": len(self.endpoints),
                "components_discovered": len(self.components),
                "database_models_found": len(self.database_schemas),
                "frameworks_detected": structure_analysis["frameworks_detected"],
                "recommendations": self._generate_scan_recommendations()
            }
        }
        
        self.logger.info(f"MERN scan completed: {len(self.endpoints)} endpoints, {len(self.components)} components")
        return results
    
    def _analyze_project_structure(self, root_path: Path) -> Dict[str, Any]:
        """Analyze the MERN project structure to identify components."""
        import json
        
        structure = {
            "total_files": 0,
            "mern_components": {
                "has_react": False,
                "has_express": False,
                "has_mongodb": False,
                "has_nodejs": False
            },
            "frameworks_detected": [],
            "directories": {},
            "package_json_files": []
        }
        
        # Walk through directory structure
        for file_path in root_path.rglob("*"):
            if file_path.is_file():
                structure["total_files"] += 1
                
                # Check for package.json files to identify Node.js projects
                if file_path.name == "package.json":
                    structure["package_json_files"].append(str(file_path))
                    try:
                        with open(file_path, 'r') as f:
                            package_data = json.load(f)
                            self._analyze_package_json(package_data, structure)
                    except Exception as e:
                        self.logger.warning(f"Could not parse package.json at {file_path}: {e}")
                
                # Analyze file extensions and patterns
                self._analyze_file_for_mern_indicators(file_path, structure)
        
        return structure
    
    def _analyze_package_json(self, package_data: Dict[str, Any], structure: Dict[str, Any]):
        """Analyze package.json for MERN stack indicators."""
        dependencies = {}
        dependencies.update(package_data.get("dependencies", {}))
        dependencies.update(package_data.get("devDependencies", {}))
        
        # Check for React
        if "react" in dependencies or "react-dom" in dependencies:
            structure["mern_components"]["has_react"] = True
            structure["frameworks_detected"].append("React")
        
        # Check for Express
        if "express" in dependencies:
            structure["mern_components"]["has_express"] = True
            structure["frameworks_detected"].append("Express")
        
        # Check for MongoDB
        if any(dep in dependencies for dep in ["mongoose", "mongodb", "monk"]):
            structure["mern_components"]["has_mongodb"] = True
            structure["frameworks_detected"].append("MongoDB")
        
        # Node.js is implicit if package.json exists
        structure["mern_components"]["has_nodejs"] = True
        if "Node.js" not in structure["frameworks_detected"]:
            structure["frameworks_detected"].append("Node.js")
    
    def _analyze_file_for_mern_indicators(self, file_path: Path, structure: Dict[str, Any]):
        """Analyze individual files for MERN stack indicators."""
        try:
            if file_path.suffix in [".js", ".jsx", ".ts", ".tsx"]:
                content = file_path.read_text(encoding='utf-8', errors='ignore')
                
                # Check for React components
                if any(pattern in content for pattern in ["import React", "from 'react'", "React.Component"]):
                    structure["mern_components"]["has_react"] = True
                
                # Check for Express patterns
                if any(pattern in content for pattern in ["require('express')", "import express", "app.get", "app.post"]):
                    structure["mern_components"]["has_express"] = True
                
                # Check for MongoDB/Mongoose patterns
                if any(pattern in content for pattern in ["mongoose", "mongodb", "Schema", ".collection("]):
                    structure["mern_components"]["has_mongodb"] = True
        
        except Exception as e:
            # Ignore files that can't be read
            pass
    
    def _extract_endpoints_from_codebase(self, root_path: Path):
        """Extract API endpoints from the codebase."""
        for file_path in root_path.rglob("*.js"):
            try:
                if file_path.is_file():
                    self._analyze_javascript_file_for_endpoints(file_path)
            except Exception as e:
                self.logger.warning(f"Error analyzing {file_path}: {e}")
        
        for file_path in root_path.rglob("*.py"):
            try:
                if file_path.is_file():
                    self._analyze_python_file_for_endpoints(file_path)
            except Exception as e:
                self.logger.warning(f"Error analyzing {file_path}: {e}")
    
    def _analyze_javascript_file_for_endpoints(self, file_path: Path):
        """Analyze JavaScript files for Express endpoints."""
        try:
            content = file_path.read_text(encoding='utf-8', errors='ignore')
            lines = content.split('\n')
            
            for i, line in enumerate(lines):
                # Check Express patterns
                for pattern in self.EXPRESS_PATTERNS:
                    matches = pattern.findall(line)
                    for match in matches:
                        if isinstance(match, tuple) and len(match) >= 2:
                            method, path = match[0], match[1]
                        else:
                            method, path = 'GET', match if isinstance(match, str) else str(match)
                        
                        # Extract additional information
                        middleware = self._extract_middleware_from_line(line)
                        auth = self._extract_auth_from_context(content, i)
                        
                        endpoint = MERNEndpoint(
                            path=path,
                            method=method.upper(),
                            function_name=self._extract_function_name(content, i),
                            file_path=str(file_path),
                            line_number=i + 1,
                            framework="Express",
                            middleware=middleware,
                            authentication=auth,
                            validation_schema=None,
                            response_schema=None,
                            database_models=self._extract_db_models_from_context(content, i),
                            parameters=self._extract_parameters_from_path(path),
                            headers=[],
                            dependencies=[],
                            docstring=None,
                            comments=self._extract_comments_from_context(lines, i),
                            security_annotations=[]
                        )
                        
                        self.endpoints.append(endpoint)
        
        except Exception as e:
            self.logger.error(f"Error analyzing JavaScript file {file_path}: {e}")
    
    def _analyze_python_file_for_endpoints(self, file_path: Path):
        """Analyze Python files for Flask/FastAPI endpoints."""
        # Implementation similar to JavaScript but for Python frameworks
        pass  # Placeholder for now
    
    def _discover_mern_components(self, root_path: Path):
        """Discover MERN application components."""
        # Walk through the directory to identify components
        for file_path in root_path.rglob("*"):
            if file_path.is_file():
                component = self._analyze_file_as_component(file_path)
                if component:
                    self.components.append(component)
    
    def _analyze_file_as_component(self, file_path: Path) -> Optional[MERNComponent]:
        """Analyze a file to determine if it's a MERN component."""
        try:
            if file_path.suffix in [".js", ".jsx", ".ts", ".tsx"]:
                content = file_path.read_text(encoding='utf-8', errors='ignore')
                
                # Determine component type
                component_type = "unknown"
                if "Schema" in content or "model" in content.lower():
                    component_type = "model"
                elif "router" in content.lower() or "app.get" in content:
                    component_type = "route"
                elif "middleware" in file_path.name.lower():
                    component_type = "middleware"
                elif "controller" in file_path.name.lower():
                    component_type = "controller"
                elif "React" in content or "Component" in content:
                    component_type = "react_component"
                
                if component_type != "unknown":
                    return MERNComponent(
                        name=file_path.stem,
                        type=component_type,
                        file_path=str(file_path),
                        dependencies=self._extract_dependencies_from_file(content),
                        exports=self._extract_exports_from_file(content),
                        database_collections=self._extract_db_collections_from_file(content),
                        api_endpoints=self._extract_related_endpoints(content)
                    )
        except Exception as e:
            self.logger.warning(f"Error analyzing component {file_path}: {e}")
        
        return None
    
    async def _check_api_service_status(self, api_url: str) -> Dict[str, Any]:
        """Check if the API service is running."""
        import aiohttp
        import asyncio
        
        status = {
            "is_running": False,
            "response_time": None,
            "status_code": None,
            "error": None
        }
        
        try:
            start_time = asyncio.get_event_loop().time()
            async with aiohttp.ClientSession(timeout=aiohttp.ClientTimeout(total=10)) as session:
                async with session.get(api_url) as response:
                    end_time = asyncio.get_event_loop().time()
                    status["is_running"] = True
                    status["response_time"] = (end_time - start_time) * 1000  # ms
                    status["status_code"] = response.status
        except Exception as e:
            status["error"] = str(e)
        
        return status
    
    def _generate_scan_recommendations(self) -> List[str]:
        """Generate recommendations based on scan results."""
        recommendations = []
        
        if len(self.endpoints) == 0:
            recommendations.append("No API endpoints detected. Ensure the application has proper route definitions.")
        elif len(self.endpoints) < 5:
            recommendations.append("Limited API endpoints found. Consider reviewing route file locations.")
        
        if len(self.components) == 0:
            recommendations.append("No MERN components identified. Verify project structure and naming conventions.")
        
        if len(self.database_schemas) == 0:
            recommendations.append("No database models detected. Consider adding Mongoose schemas or database models.")
        
        # Add authentication recommendations
        auth_endpoints = [ep for ep in self.endpoints if ep.authentication]
        if len(auth_endpoints) == 0:
            recommendations.append("No authentication mechanisms detected. Consider implementing API security.")
        
        return recommendations
    
    # Helper methods for extraction
    def _extract_middleware_from_line(self, line: str) -> List[str]:
        """Extract middleware from a route line."""
        middleware = []
        # Simple regex to find middleware patterns
        middleware_pattern = r'\.(use|get|post|put|delete)\s*\([^,]+,\s*([^,)]+)'
        matches = re.findall(middleware_pattern, line)
        for match in matches:
            if len(match) > 1:
                middleware.append(match[1].strip())
        return middleware
    
    def _extract_auth_from_context(self, content: str, line_index: int) -> Optional[str]:
        """Extract authentication information from context."""
        # Look for auth patterns in surrounding lines
        for pattern in self.AUTH_PATTERNS:
            if pattern.search(content):
                return "detected"
        return None
    
    def _extract_function_name(self, content: str, line_index: int) -> str:
        """Extract function name associated with the endpoint."""
        lines = content.split('\n')
        # Look for function definitions around the endpoint
        for i in range(max(0, line_index - 5), min(len(lines), line_index + 5)):
            line = lines[i]
            if 'function' in line or '=>' in line:
                # Extract function name (simplified)
                if 'function' in line:
                    match = re.search(r'function\s+([a-zA-Z_][a-zA-Z0-9_]*)', line)
                    if match:
                        return match.group(1)
                elif '=>' in line:
                    match = re.search(r'([a-zA-Z_][a-zA-Z0-9_]*)\s*=.*=>', line)
                    if match:
                        return match.group(1)
        return "anonymous"
    
    def _extract_db_models_from_context(self, content: str, line_index: int) -> List[str]:
        """Extract database models from context."""
        models = []
        for pattern in self.DB_MODEL_PATTERNS:
            matches = pattern.findall(content)
            models.extend(matches)
        return list(set(models))
    
    def _extract_parameters_from_path(self, path: str) -> List[Dict[str, Any]]:
        """Extract parameters from the API path."""
        params = []
        # Find path parameters like :id, :name
        param_matches = re.findall(r':([a-zA-Z_][a-zA-Z0-9_]*)', path)
        for param in param_matches:
            params.append({
                "name": param,
                "type": "path",
                "required": True
            })
        return params
    
    def _extract_comments_from_context(self, lines: List[str], line_index: int) -> List[str]:
        """Extract comments from surrounding context."""
        comments = []
        # Look for comments in surrounding lines
        for i in range(max(0, line_index - 3), min(len(lines), line_index + 1)):
            line = lines[i].strip()
            if line.startswith('//'):
                comments.append(line[2:].strip())
            elif '/*' in line and '*/' in line:
                comment = re.search(r'/\*(.+?)\*/', line)
                if comment:
                    comments.append(comment.group(1).strip())
        return comments
    
    def _extract_dependencies_from_file(self, content: str) -> List[str]:
        """Extract dependencies from file content."""
        dependencies = []
        # Find require statements
        require_matches = re.findall(r'require\(["\']([^"\']*)["\'\]', content)
        dependencies.extend(require_matches)
        
        # Find import statements
        import_matches = re.findall(r'import.*from\s+["\']([^"\']*)["\'\]', content)
        dependencies.extend(import_matches)
        
        return list(set(dependencies))
    
    def _extract_exports_from_file(self, content: str) -> List[str]:
        """Extract exports from file content."""
        exports = []
        # Find module.exports
        export_matches = re.findall(r'module\.exports\s*=\s*([a-zA-Z_][a-zA-Z0-9_]*)', content)
        exports.extend(export_matches)
        
        # Find export statements
        export_matches = re.findall(r'export\s+(?:default\s+)?([a-zA-Z_][a-zA-Z0-9_]*)', content)
        exports.extend(export_matches)
        
        return list(set(exports))
    
    def _extract_db_collections_from_file(self, content: str) -> List[str]:
        """Extract database collections from file content."""
        collections = []
        for pattern in self.DB_MODEL_PATTERNS:
            matches = pattern.findall(content)
            collections.extend(matches)
        return list(set(collections))
    
    def _extract_related_endpoints(self, content: str) -> List[str]:
        """Extract related API endpoints from file content."""
        endpoints = []
        for pattern in self.EXPRESS_PATTERNS:
            matches = pattern.findall(content)
            for match in matches:
                if isinstance(match, tuple) and len(match) >= 2:
                    endpoints.append(f"{match[0].upper()} {match[1]}")
        return endpoints
    
    def scan_mern_application_legacy(self, root_path: Union[str, Path],
                              target_api_running: bool = False,
                              api_url: Optional[str] = None) -> Dict[str, Any]:
        """
        Legacy entry point for scanning a MERN application.
        Follows the workflow diagram: Codebase Scanner -> Extract Endpoints -> API Service Running
        """
        root = Path(root_path)
        if not root.exists():
            return {"error": f"Path {root_path} does not exist"}
        
        self.logger.info(f"Starting MERN application scan of {root_path}")
        
        # Step 1: Analyze project structure
        project_info = self._analyze_project_structure(root)
        
        # Step 2: Scan for endpoints and components
        scan_results = self._scan_codebase(root)
        
        # Step 3: Extract API service information (if running)
        api_service_info = {}
        if target_api_running and api_url:
            api_service_info = self._analyze_running_api(api_url)
        
        # Step 4: Generate comprehensive analysis
        analysis = {
            "project_info": project_info,
            "scan_results": scan_results,
            "api_service_info": api_service_info,
            "endpoints": [ep.to_meta() for ep in self.endpoints],
            "components": [comp.to_meta() for comp in self.components],
            "summary": self._generate_summary(),
            "recommendations": self._generate_recommendations()
        }
        
        self.logger.info(f"MERN scan completed: {len(self.endpoints)} endpoints, {len(self.components)} components")
        return analysis
    
    def _analyze_project_structure(self, root: Path) -> Dict[str, Any]:
        """Analyze MERN project structure and identify components."""
        structure = {
            "type": "unknown",
            "framework": [],
            "package_managers": [],
            "databases": [],
            "frontend_frameworks": [],
            "directories": {},
            "config_files": []
        }
        
        # Check for package.json (Node.js/MERN indicator)
        package_json_path = root / "package.json"
        if package_json_path.exists():
            try:
                with open(package_json_path, 'r') as f:
                    package_data = json.load(f)
                    structure["type"] = "nodejs"
                    structure["name"] = package_data.get("name", "unknown")
                    structure["version"] = package_data.get("version", "unknown")
                    
                    # Identify dependencies
                    deps = package_data.get("dependencies", {})
                    dev_deps = package_data.get("devDependencies", {})
                    all_deps = {**deps, **dev_deps}
                    
                    # Identify frameworks
                    if "express" in all_deps:
                        structure["framework"].append("Express.js")
                    if "fastify" in all_deps:
                        structure["framework"].append("Fastify")
                    if "koa" in all_deps:
                        structure["framework"].append("Koa.js")
                    
                    # Database detection
                    if "mongoose" in all_deps or "mongodb" in all_deps:
                        structure["databases"].append("MongoDB")
                    if "pg" in all_deps or "postgresql" in all_deps:
                        structure["databases"].append("PostgreSQL")
                    if "mysql" in all_deps or "mysql2" in all_deps:
                        structure["databases"].append("MySQL")
                    
                    # Frontend detection
                    if "react" in all_deps:
                        structure["frontend_frameworks"].append("React")
                    if "vue" in all_deps:
                        structure["frontend_frameworks"].append("Vue.js")
                    if "angular" in all_deps:
                        structure["frontend_frameworks"].append("Angular")
                    
            except Exception as e:
                self.logger.warning(f"Error reading package.json: {e}")
        
        # Analyze directory structure
        common_dirs = ["routes", "controllers", "models", "middleware", "utils", "config", "public", "views", "src", "client", "server"]
        for dir_name in common_dirs:
            dir_path = root / dir_name
            if dir_path.exists() and dir_path.is_dir():
                file_count = len(list(dir_path.rglob("*")))
                structure["directories"][dir_name] = file_count
        
        # Check for common config files
        config_files = ["app.js", "server.js", "index.js", ".env", "docker-compose.yml", "Dockerfile"]
        for config_file in config_files:
            if (root / config_file).exists():
                structure["config_files"].append(config_file)
        
        return structure
    
    def _scan_codebase(self, root: Path) -> Dict[str, Any]:
        """Scan codebase for endpoints, components, and dependencies."""
        results = {
            "files_scanned": 0,
            "endpoints_found": 0,
            "components_found": 0,
            "errors": []
        }
        
        # File extensions to scan
        extensions = ['.js', '.ts', '.jsx', '.tsx', '.py']
        
        for ext in extensions:
            for file_path in root.rglob(f"*{ext}"):
                # Skip node_modules, build, dist directories
                if any(part in ['node_modules', 'build', 'dist', '.git', '__pycache__'] 
                       for part in file_path.parts):
                    continue
                
                try:
                    self._scan_file(file_path)
                    results["files_scanned"] += 1
                except Exception as e:
                    results["errors"].append(f"Error scanning {file_path}: {str(e)}")
        
        results["endpoints_found"] = len(self.endpoints)
        results["components_found"] = len(self.components)
        
        return results
    
    def _scan_file(self, file_path: Path) -> None:
        """Scan individual file for endpoints and components."""
        try:
            content = file_path.read_text(encoding='utf-8')
            lines = content.split('\n')
            
            # Detect file type and scan accordingly
            if file_path.suffix in ['.js', '.ts', '.jsx', '.tsx']:
                self._scan_javascript_file(file_path, content, lines)
            elif file_path.suffix == '.py':
                self._scan_python_file(file_path, content, lines)
            
        except Exception as e:
            self.logger.warning(f"Error reading {file_path}: {e}")
    
    def _scan_javascript_file(self, file_path: Path, content: str, lines: List[str]) -> None:
        """Scan JavaScript/TypeScript file for Express routes and components."""
        
        # Extract Express endpoints
        for pattern in self.EXPRESS_PATTERNS:
            for match in pattern.finditer(content):
                if len(match.groups()) >= 2:
                    method = match.group(1).upper() if match.group(1) else 'USE'
                    path = match.group(2)
                    line_num = content[:match.start()].count('\n') + 1
                    
                    endpoint = self._create_endpoint_from_match(
                        match, method, path, file_path, line_num, content, lines, "Express.js"
                    )
                    if endpoint:
                        self.endpoints.append(endpoint)
        
        # Extract component information
        component = self._extract_javascript_component(file_path, content)
        if component:
            self.components.append(component)
    
    def _scan_python_file(self, file_path: Path, content: str, lines: List[str]) -> None:
        """Scan Python file for FastAPI/Flask routes."""
        # Use existing codebase analyzer patterns
        from app.services.codebase_analyzer import CodebaseAnalyzer
        
        analyzer = CodebaseAnalyzer()
        analyzer.analyze_file(file_path)
        
        # Convert to MERN endpoints
        for endpoint_info in analyzer.endpoints:
            mern_endpoint = MERNEndpoint(
                path=endpoint_info.path,
                method=endpoint_info.method,
                function_name=endpoint_info.function_name,
                file_path=endpoint_info.file_path,
                line_number=endpoint_info.line_number,
                framework="FastAPI" if "@app." in str(endpoint_info.decorators) else "Flask",
                middleware=[],
                authentication=None,
                validation_schema=None,
                response_schema=None,
                database_models=[],
                parameters=endpoint_info.parameters,
                headers=[],
                dependencies=[],
                docstring=endpoint_info.docstring,
                comments=endpoint_info.comments,
                security_annotations=[]
            )
            self.endpoints.append(mern_endpoint)
    
    def _create_endpoint_from_match(self, match, method: str, path: str, 
                                   file_path: Path, line_num: int, content: str, 
                                   lines: List[str], framework: str) -> Optional[MERNEndpoint]:
        """Create detailed endpoint information from regex match."""
        
        # Find the handler function
        function_name = self._find_handler_function(lines, line_num)
        
        # Extract middleware
        middleware = self._extract_middleware(content, match.start())
        
        # Detect authentication
        auth_type = self._detect_authentication(content, match.start(), match.end())
        
        # Extract validation schema
        validation_schema = self._extract_validation_schema(content, match.start(), match.end())
        
        # Find database models
        db_models = self._find_database_models(content)
        
        # Extract parameters from the endpoint definition
        parameters = self._extract_endpoint_parameters(content, path, match.start(), match.end())
        
        # Find security annotations
        security_annotations = self._find_security_annotations(content, match.start(), match.end())
        
        return MERNEndpoint(
            path=path,
            method=method,
            function_name=function_name or "anonymous",
            file_path=str(file_path),
            line_number=line_num,
            framework=framework,
            middleware=middleware,
            authentication=auth_type,
            validation_schema=validation_schema,
            response_schema=None,  # TODO: Extract response schema
            database_models=db_models,
            parameters=parameters,
            headers=[],  # TODO: Extract headers
            dependencies=[],  # TODO: Extract dependencies
            docstring=None,  # TODO: Extract JSDoc
            comments=[],
            security_annotations=security_annotations
        )
    
    def _find_handler_function(self, lines: List[str], start_line: int) -> Optional[str]:
        """Find the handler function name for an endpoint."""
        # Look for function definition after the route definition
        for i in range(start_line, min(len(lines), start_line + 10)):
            line = lines[i].strip()
            
            # Arrow function: (req, res) =>
            arrow_match = re.search(r'\(([^)]*)\)\s*=>', line)
            if arrow_match:
                return "arrow_function"
            
            # Named function: function handlerName
            func_match = re.search(r'function\s+(\w+)', line)
            if func_match:
                return func_match.group(1)
            
            # Method in class or object
            method_match = re.search(r'(\w+)\s*:\s*(?:function\s*)?(?:async\s*)?\(', line)
            if method_match:
                return method_match.group(1)
        
        return None
    
    def _extract_middleware(self, content: str, start_pos: int) -> List[str]:
        """Extract middleware used by an endpoint."""
        middleware = []
        
        # Look for middleware patterns near the endpoint definition
        search_area = content[max(0, start_pos-500):start_pos+500]
        
        for pattern in self.MIDDLEWARE_PATTERNS:
            for match in pattern.finditer(search_area):
                middleware_name = match.group(1).strip()
                # Clean up the middleware name
                middleware_name = re.sub(r'[\'\"()]', '', middleware_name).strip()
                if middleware_name and middleware_name not in middleware:
                    middleware.append(middleware_name)
        
        return middleware
    
    def _detect_authentication(self, content: str, start_pos: int, end_pos: int) -> Optional[str]:
        """Detect authentication mechanism used by endpoint."""
        search_area = content[max(0, start_pos-200):end_pos+200]
        
        for pattern in self.AUTH_PATTERNS:
            if pattern.search(search_area):
                if 'passport' in search_area.lower():
                    return 'passport'
                elif 'jwt' in search_area.lower():
                    return 'jwt'
                elif 'bcrypt' in search_area.lower():
                    return 'bcrypt'
                elif any(auth_keyword in search_area.lower() 
                        for auth_keyword in ['@auth', 'requireauth', 'isauthenticated']):
                    return 'custom_auth'
        
        return None
    
    def _extract_validation_schema(self, content: str, start_pos: int, end_pos: int) -> Optional[Dict[str, Any]]:
        """Extract validation schema for endpoint."""
        search_area = content[max(0, start_pos-300):end_pos+300]
        
        for pattern in self.VALIDATION_PATTERNS:
            match = pattern.search(search_area)
            if match:
                try:
                    # Simplified schema extraction - could be enhanced
                    schema_content = match.group(1) if match.groups() else match.group(0)
                    return {"type": "validation", "content": schema_content[:200]}  # Truncate for storage
                except:
                    continue
        
        return None
    
    def _find_database_models(self, content: str) -> List[str]:
        """Find database models used in the file."""
        models = []
        
        for pattern in self.DB_MODEL_PATTERNS:
            for match in pattern.finditer(content):
                model_name = match.group(1) if match.groups() else None
                if model_name and model_name not in models:
                    models.append(model_name)
        
        return models
    
    def _extract_endpoint_parameters(self, content: str, path: str, start_pos: int, end_pos: int) -> List[Dict[str, Any]]:
        """Extract parameters from endpoint path and surrounding code."""
        parameters = []
        
        # Extract path parameters (e.g., /users/:id)
        path_params = re.findall(r':(\w+)', path)
        for param in path_params:
            parameters.append({
                "name": param,
                "type": "path",
                "required": True,
                "location": "path"
            })
        
        # Extract query parameters from surrounding code
        search_area = content[start_pos:end_pos+500]
        query_patterns = [
            re.compile(r'req\.query\.(\w+)'),
            re.compile(r'req\.params\.(\w+)'),
            re.compile(r'req\.body\.(\w+)')
        ]
        
        for pattern in query_patterns:
            for match in pattern.finditer(search_area):
                param_name = match.group(1)
                param_type = "query" if "query" in match.group(0) else "body" if "body" in match.group(0) else "path"
                
                if not any(p["name"] == param_name for p in parameters):
                    parameters.append({
                        "name": param_name,
                        "type": param_type,
                        "required": False,
                        "location": param_type
                    })
        
        return parameters
    
    def _find_security_annotations(self, content: str, start_pos: int, end_pos: int) -> List[str]:
        """Find security-related annotations or middleware."""
        security = []
        search_area = content[max(0, start_pos-100):end_pos+100]
        
        security_keywords = ['cors', 'helmet', 'ratelimit', 'csrf', 'xss', 'auth', 'permission']
        
        for keyword in security_keywords:
            if keyword.lower() in search_area.lower():
                security.append(keyword)
        
        return security
    
    def _extract_javascript_component(self, file_path: Path, content: str) -> Optional[MERNComponent]:
        """Extract component information from JavaScript file."""
        
        # Detect component type based on file path and content
        component_type = "unknown"
        if "routes" in str(file_path) or "route" in str(file_path):
            component_type = "route"
        elif "controller" in str(file_path) or "ctrl" in str(file_path):
            component_type = "controller"
        elif "model" in str(file_path):
            component_type = "model"
        elif "middleware" in str(file_path):
            component_type = "middleware"
        elif "util" in str(file_path) or "helper" in str(file_path):
            component_type = "utility"
        
        # Extract dependencies (require/import statements)
        dependencies = []
        import_patterns = [
            re.compile(r'require\s*\(\s*[\'\"](.*?)[\'\"]'),
            re.compile(r'import\s+.*?\s+from\s+[\'\"](.*?)[\'\"]'),
            re.compile(r'import\s*\(\s*[\'\"](.*?)[\'\"]')
        ]
        
        for pattern in import_patterns:
            for match in pattern.finditer(content):
                dep = match.group(1)
                if not dep.startswith('.'):  # External dependency
                    dependencies.append(dep)
        
        # Extract exports
        exports = []
        export_patterns = [
            re.compile(r'module\.exports\s*=\s*(\w+)'),
            re.compile(r'exports\.(\w+)'),
            re.compile(r'export\s+(?:default\s+)?(?:function\s+)?(\w+)'),
            re.compile(r'export\s*\{\s*(.*?)\s*\}')
        ]
        
        for pattern in export_patterns:
            for match in pattern.finditer(content):
                if match.groups():
                    export_name = match.group(1)
                    if ',' in export_name:  # Multiple exports
                        exports.extend([e.strip() for e in export_name.split(',')])
                    else:
                        exports.append(export_name)
        
        # Find database collections
        db_collections = self._find_database_models(content)
        
        # Find related API endpoints (if this is a route file)
        api_endpoints = []
        if component_type == "route":
            for endpoint in self.endpoints:
                if endpoint.file_path == str(file_path):
                    api_endpoints.append(f"{endpoint.method} {endpoint.path}")
        
        return MERNComponent(
            name=file_path.stem,
            type=component_type,
            file_path=str(file_path),
            dependencies=dependencies,
            exports=exports,
            database_collections=db_collections,
            api_endpoints=api_endpoints
        )
    
    def _analyze_running_api(self, api_url: str) -> Dict[str, Any]:
        """Analyze a running API service to extract runtime information."""
        import requests
        
        api_info = {
            "url": api_url,
            "status": "unknown",
            "endpoints_discovered": [],
            "health_check": False,
            "openapi_spec": None
        }
        
        try:
            # Test basic connectivity
            response = requests.get(f"{api_url}/health", timeout=5)
            if response.status_code == 200:
                api_info["health_check"] = True
                api_info["status"] = "running"
            
            # Try to get OpenAPI spec
            spec_endpoints = ["/openapi.json", "/swagger.json", "/api-docs", "/docs"]
            for spec_endpoint in spec_endpoints:
                try:
                    spec_response = requests.get(f"{api_url}{spec_endpoint}", timeout=5)
                    if spec_response.status_code == 200:
                        api_info["openapi_spec"] = spec_response.json()
                        break
                except:
                    continue
            
            # Discovery endpoints (if available)
            try:
                discovery_response = requests.get(f"{api_url}/api", timeout=5)
                if discovery_response.status_code == 200:
                    # Parse discovered endpoints
                    pass
            except:
                pass
                
        except Exception as e:
            api_info["status"] = f"error: {str(e)}"
        
        return api_info
    
    def _generate_summary(self) -> Dict[str, Any]:
        """Generate comprehensive summary of the MERN application scan."""
        frameworks = set()
        methods = {}
        auth_types = set()
        db_models = set()
        
        for endpoint in self.endpoints:
            frameworks.add(endpoint.framework)
            methods[endpoint.method] = methods.get(endpoint.method, 0) + 1
            if endpoint.authentication:
                auth_types.add(endpoint.authentication)
            db_models.update(endpoint.database_models)
        
        component_types = {}
        for component in self.components:
            component_types[component.type] = component_types.get(component.type, 0) + 1
        
        return {
            "total_endpoints": len(self.endpoints),
            "total_components": len(self.components),
            "frameworks_detected": list(frameworks),
            "http_methods": methods,
            "authentication_types": list(auth_types),
            "database_models": list(db_models),
            "component_types": component_types,
            "security_score": self._calculate_security_score(),
            "coverage_potential": self._estimate_test_coverage_potential()
        }
    
    def _calculate_security_score(self) -> float:
        """Calculate a basic security score based on detected security measures."""
        total_endpoints = len(self.endpoints)
        if total_endpoints == 0:
            return 0.0
        
        security_points = 0
        for endpoint in self.endpoints:
            if endpoint.authentication:
                security_points += 2
            if endpoint.validation_schema:
                security_points += 1
            security_points += len(endpoint.security_annotations)
        
        # Normalize to 0-100 scale
        max_possible_points = total_endpoints * 4  # 2 for auth, 1 for validation, 1 for annotations
        return min(100.0, (security_points / max_possible_points) * 100) if max_possible_points > 0 else 0.0
    
    def _estimate_test_coverage_potential(self) -> Dict[str, Any]:
        """Estimate the potential test coverage based on endpoint complexity."""
        if not self.endpoints:
            return {"score": 0, "complexity": "none"}
        
        complexity_score = 0
        for endpoint in self.endpoints:
            # Base complexity
            complexity_score += 1
            
            # Add complexity for parameters
            complexity_score += len(endpoint.parameters) * 0.5
            
            # Add complexity for authentication
            if endpoint.authentication:
                complexity_score += 1
            
            # Add complexity for validation
            if endpoint.validation_schema:
                complexity_score += 1
            
            # Add complexity for database models
            complexity_score += len(endpoint.database_models) * 0.5
        
        avg_complexity = complexity_score / len(self.endpoints)
        
        if avg_complexity < 2:
            complexity_level = "low"
        elif avg_complexity < 4:
            complexity_level = "medium"
        else:
            complexity_level = "high"
        
        return {
            "score": complexity_score,
            "average_complexity": avg_complexity,
            "complexity": complexity_level,
            "test_cases_needed": int(complexity_score * 2)  # Estimate 2 tests per complexity point
        }
    
    def _generate_recommendations(self) -> List[str]:
        """Generate recommendations based on the scan results."""
        recommendations = []
        
        # Security recommendations
        unauth_endpoints = [ep for ep in self.endpoints if not ep.authentication]
        if unauth_endpoints:
            recommendations.append(
                f"Consider adding authentication to {len(unauth_endpoints)} endpoints without auth"
            )
        
        # Validation recommendations
        unvalidated_endpoints = [ep for ep in self.endpoints if not ep.validation_schema]
        if unvalidated_endpoints:
            recommendations.append(
                f"Add input validation to {len(unvalidated_endpoints)} endpoints"
            )
        
        # Testing recommendations
        complex_endpoints = [ep for ep in self.endpoints if len(ep.parameters) > 3]
        if complex_endpoints:
            recommendations.append(
                f"Focus testing on {len(complex_endpoints)} complex endpoints with many parameters"
            )
        
        # Documentation recommendations
        undocumented_endpoints = [ep for ep in self.endpoints if not ep.docstring]
        if undocumented_endpoints:
            recommendations.append(
                f"Add documentation to {len(undocumented_endpoints)} undocumented endpoints"
            )
        
        return recommendations