from fastapi import APIRouter, UploadFile, File, Depends, Form
from typing import Dict, List, Any, Optional
from pathlib import Path
import tempfile
import os

from app.dependencies import get_knowledge_base, get_ingestion_service
from app.services.knowledge_base import KnowledgeBase
from app.services.ingestion import IngestionService
from app.services.mern_scanner import MERNScanner


router = APIRouter()


@router.post("/batch")
async def batch_ingest(
    specs: List[UploadFile] = File(default=[]),
    docs: List[UploadFile] = File(default=[]),
    logs: List[UploadFile] = File(default=[]),
    codebase_paths: Optional[str] = Form(default=None),
    service: IngestionService = Depends(get_ingestion_service),
) -> Dict[str, Any]:
    """Enhanced batch ingestion supporting specs, docs, logs, and codebase analysis."""
    # Create temporary directory for uploads
    with tempfile.TemporaryDirectory() as temp_dir:
        temp_path = Path(temp_dir)
        
        # Save uploaded files
        spec_paths: List[str] = []
        doc_paths: List[str] = []
        log_paths: List[str] = []
        
        for f in specs:
            if f.filename:
                path = temp_path / f.filename
                with open(path, "wb") as out:
                    out.write(await f.read())
                spec_paths.append(str(path))
        
        for f in docs:
            if f.filename:
                path = temp_path / f.filename
                with open(path, "wb") as out:
                    out.write(await f.read())
                doc_paths.append(str(path))
        
        for f in logs:
            if f.filename:
                path = temp_path / f.filename
                with open(path, "wb") as out:
                    out.write(await f.read())
                log_paths.append(str(path))
        
        # Parse codebase paths
        codebase_path_list = []
        if codebase_paths:
            codebase_path_list = [p.strip() for p in codebase_paths.split(",") if p.strip()]
        
        # Perform ingestion
        result = service.ingest(
            spec_files=spec_paths,
            doc_files=doc_paths,
            logs=log_paths if log_paths else None,
            codebase_paths=codebase_path_list if codebase_path_list else None
        )
        
        return {"message": "Enhanced ingestion completed", **result}


@router.post("/specs")
async def ingest_specs(
    files: List[UploadFile] = File(...),
    service: IngestionService = Depends(get_ingestion_service),
) -> Dict[str, Any]:
    """Ingest API specification files (OpenAPI/Swagger)."""
    with tempfile.TemporaryDirectory() as temp_dir:
        temp_path = Path(temp_dir)
        spec_paths = []
        
        for f in files:
            if f.filename:
                path = temp_path / f.filename
                with open(path, "wb") as out:
                    out.write(await f.read())
                spec_paths.append(str(path))
        
        result = service.ingest(spec_files=spec_paths, doc_files=[])
        return {"message": "API specifications ingested", **result}


@router.post("/logs")
async def ingest_logs(
    files: List[UploadFile] = File(...),
    service: IngestionService = Depends(get_ingestion_service),
) -> Dict[str, Any]:
    """Ingest log files for usage pattern analysis."""
    with tempfile.TemporaryDirectory() as temp_dir:
        temp_path = Path(temp_dir)
        log_paths = []
        
        for f in files:
            if f.filename:
                path = temp_path / f.filename
                with open(path, "wb") as out:
                    out.write(await f.read())
                log_paths.append(str(path))
        
        result = service.ingest(spec_files=[], doc_files=[], logs=log_paths)
        return {"message": "Log files ingested", **result}


@router.post("/codebase")
async def ingest_codebase(
    paths: str = Form(..., description="Comma-separated list of codebase paths to analyze"),
    service: IngestionService = Depends(get_ingestion_service),
) -> Dict[str, Any]:
    """Analyze codebase for API endpoints and comments."""
    codebase_paths = [p.strip() for p in paths.split(",") if p.strip()]
    
    # Validate paths exist
    valid_paths = []
    for path in codebase_paths:
        if Path(path).exists():
            valid_paths.append(path)
    
    if not valid_paths:
        return {"error": "No valid paths provided", "provided_paths": codebase_paths}
    
    result = service.ingest(spec_files=[], doc_files=[], codebase_paths=valid_paths)
    return {"message": "Codebase analyzed", **result}


@router.post("/mern-scan")
async def scan_mern_application(
    root_path: str = Form(..., description="Root path of the MERN application to scan"),
    target_api_running: bool = Form(default=False, description="Whether the target API is currently running"),
    api_url: Optional[str] = Form(default=None, description="URL of the running API service"),
    service: IngestionService = Depends(get_ingestion_service),
) -> Dict[str, Any]:
    """Scan a MERN application following the workflow diagram."""
    scanner = MERNScanner()
    
    # Perform comprehensive MERN application scan
    scan_results = scanner.scan_mern_application(
        root_path=root_path,
        target_api_running=target_api_running,
        api_url=api_url
    )
    
    if "error" in scan_results:
        return scan_results
    
    # Ingest the scan results into the knowledge base
    endpoints_text = []
    components_text = []
    
    for endpoint in scanner.endpoints:
        endpoints_text.append(endpoint.to_text())
    
    for component in scanner.components:
        components_text.append(component.to_text())
    
    # Use the existing ingestion service to store the results
    ingest_result = service.ingest(
        spec_files=[],
        doc_files=[],
        raw_texts=endpoints_text + components_text,
        metadata_list=[ep.to_meta() for ep in scanner.endpoints] + [comp.to_meta() for comp in scanner.components]
    )
    
    return {
        "message": "MERN application scan completed",
        "scan_results": scan_results,
        "ingestion_results": ingest_result
    }


@router.get("/status")
async def ingestion_status(
    kb: KnowledgeBase = Depends(get_knowledge_base)
) -> Dict[str, Any]:
    """Get current knowledge base statistics."""
    stats = await kb.get_stats()
    return {"status": "active", "knowledge_base": stats}


