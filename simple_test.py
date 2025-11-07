#!/usr/bin/env python3
"""
Simple test script to demonstrate the API ingestion workflow.
"""

import asyncio
import sys
from pathlib import Path

# Add the app directory to the Python path
sys.path.append(str(Path(__file__).parent / "app"))

from app.services.ingestion import IngestionService
from app.services.knowledge_base import KnowledgeBase
from app.services.embeddings import EmbeddingModel


async def test_workflow():
    """Test the complete API ingestion workflow."""
    print("Starting API Ingestion Workflow Test")
    print("=" * 50)
    
    # Initialize services
    print("\nInitializing services...")
    kb = KnowledgeBase("test_api_kb")
    embedder = EmbeddingModel()
    ingestion_service = IngestionService(kb, embedder)
    
    # Test data
    spec_files = ["api/specs/sample_api.yaml"]
    doc_files = ["docs/api_documentation.md"]
    log_files = ["input/examples/sample_logs.log"]
    codebase_paths = ["app"]
    
    print(f"API Specs: {spec_files}")
    print(f"Documentation: {doc_files}")
    print(f"Log files: {log_files}")
    print(f"Codebase paths: {codebase_paths}")
    
    # Perform ingestion
    print("\nPerforming ingestion...")
    try:
        result = ingestion_service.ingest(
            spec_files=spec_files,
            doc_files=doc_files,
            logs=log_files,
            codebase_paths=codebase_paths
        )
        
        print("Ingestion Results:")
        for key, value in result.items():
            print(f"  {key}: {value}")
        
        # Get knowledge base statistics
        stats = await kb.get_stats()
        print("\nKnowledge Base Statistics:")
        for key, value in stats.items():
            print(f"  {key}: {value}")
        
        # Test search
        print("\nTesting search functionality...")
        results = await kb.search("user endpoint", limit=3)
        print(f"Search results: {len(results)} found")
        
        if results:
            for i, result in enumerate(results[:2], 1):
                source = result.get('metadata', {}).get('source', 'unknown')
                text_preview = result.get('text', '')[:100] + "..."
                print(f"  {i}. [{source}] {text_preview}")
        
        print("\nWorkflow test completed successfully!")
        return True
        
    except Exception as e:
        print(f"Error during ingestion: {e}")
        import traceback
        traceback.print_exc()
        return False


if __name__ == "__main__":
    print("API Ingestion Workflow Test")
    print("=" * 40)
    
    try:
        success = asyncio.run(test_workflow())
        if success:
            print("\nAll tests passed!")
        else:
            print("\nTests failed!")
            sys.exit(1)
    except Exception as e:
        print(f"Test failed with error: {e}")
        sys.exit(1)