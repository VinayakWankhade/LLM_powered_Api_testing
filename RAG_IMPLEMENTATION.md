# RAG Implementation in MERN AI Testing Platform

This document outlines the complete RAG (Retrieval Augmented Generation) implementation that follows the workflow diagram you provided.

## Architecture Overview

The RAG system implements the exact workflow from your diagram:

```
User Question → Embedding Model → Vector Embeddings → Vector DB → Top-k Retrieval → Re-ranker Model → LLM Generation → Answer
```

## Components Implemented

### 1. Embedding Model (`app/services/embeddings.py`)
- **Enhanced EmbeddingService** with support for both sentence transformers and OpenAI embeddings
- Implements vector embedding generation for queries and documents
- Features:
  - Multiple embedding model support (sentence-transformers, OpenAI API)
  - Batch processing for large document sets
  - Similarity computation and embedding metadata
  - Configurable embedding dimensions

### 2. Vector Database (`app/services/knowledge_base.py`)
- **Enhanced KnowledgeBase** using ChromaDB as the vector database
- Features:
  - Document ingestion with automatic embedding generation
  - Top-k similarity retrieval
  - Metadata filtering and search
  - Context optimization for LLM consumption
  - Statistics and cleanup functions

### 3. Top-k Retrieval
- Implemented in the KnowledgeBase service
- `retrieve_top_k()` method fetches most similar documents
- Supports filtering by metadata (source type, file type, etc.)
- Configurable number of results

### 4. Re-ranker Model (`app/services/reranker.py`)
- **RerankerService** with sophisticated ranking algorithms
- Multiple ranking factors:
  - Semantic similarity (from vector search)
  - Keyword overlap (Jaccard similarity)
  - Document freshness (recency scoring)
  - Document quality (length, structure indicators)
  - Domain relevance (MERN-specific terms)
  - Optional cross-encoder scoring
- Weighted scoring system with configurable weights
- Ranking explanations for transparency

### 5. LLM Generation (`app/services/generation.py`)
- **Enhanced GenerationService** with RAG integration
- `generate_with_rag()` method implements the complete RAG workflow
- Features:
  - Context-aware test case generation
  - Retrieved document integration
  - Fallback mechanisms when components unavailable
  - Metadata tracking for generated content

### 6. Document Chunking and Ingestion (`app/services/document_ingestion.py`)
- **DocumentIngestionPipeline** for processing MERN applications
- Smart chunking strategies:
  - File-type specific processing (JS, TS, Python, JSON, Markdown)
  - API endpoint extraction
  - Interface and type definition extraction
  - Overlap-based text chunking
- Metadata enrichment for better retrieval
- Support for various file formats

### 7. RAG Orchestrator (`app/services/rag_orchestrator.py`)
- **RAGOrchestrator** coordinates the entire RAG workflow
- Main methods:
  - `query_rag_system()` - Complete query processing workflow
  - `ingest_mern_application()` - Ingest entire MERN apps
  - `generate_tests_with_rag()` - RAG-enhanced test generation
  - `get_rag_stats()` - System statistics and monitoring

## API Endpoints

The following RAG-specific endpoints are available in `/workflow/` router:

### Core RAG Operations
- `POST /workflow/rag/initialize` - Initialize RAG system
- `POST /workflow/rag/ingest-mern-app` - Ingest MERN application
- `POST /workflow/rag/query` - Query RAG system with questions
- `GET /workflow/rag/search` - Direct knowledge base search
- `GET /workflow/rag/stats` - Get system statistics

### Test Generation
- `POST /workflow/rag/generate-tests` - Generate tests using RAG
- `POST /workflow/rag/ingest-test-results` - Ingest test results for learning

## Frontend Integration

### RAG Workflow View (`frontend/src/components/views/RAGWorkflowView.tsx`)
- Complete RAG workflow visualization
- Interactive query interface
- MERN application ingestion interface
- Real-time statistics and system status
- Visual workflow diagram matching your provided image
- Three main tabs:
  1. **Query System** - Ask questions and get AI answers
  2. **Ingest Data** - Add MERN applications to knowledge base
  3. **System Status** - Monitor RAG system health

## Workflow Process

### 1. Document Ingestion
```python
# Ingest a MERN application
rag_orchestrator = RAGOrchestrator()
result = await rag_orchestrator.ingest_mern_application("/path/to/mern/app")
```

### 2. Query Processing
```python
# Query the RAG system
result = await rag_orchestrator.query_rag_system(
    query="How do I test authentication endpoints?",
    max_results=5,
    include_ranking_details=True
)
```

### 3. Test Generation with RAG
```python
# Generate tests using RAG
test_cases, metadata = await rag_orchestrator.generate_tests_with_rag(
    query="Generate security tests for user registration",
    endpoint="/api/users/register",
    method="POST"
)
```

## Configuration

### Embedding Model Configuration
```python
# Use sentence transformers (default)
embedding_service = EmbeddingService()

# Use OpenAI embeddings
embedding_service = EmbeddingService(
    use_openai=True, 
    openai_client=openai_client
)
```

### Re-ranker Weights
```python
reranker = RerankerService()
reranker.ranking_weights = {
    'semantic_similarity': 0.4,
    'keyword_overlap': 0.25,
    'freshness': 0.15,
    'document_quality': 0.1,
    'domain_relevance': 0.1
}
```

## Key Features

### Intelligence
- **Context-aware responses** using retrieved MERN application knowledge
- **Multi-factor ranking** for improved relevance
- **Domain-specific optimization** for API testing scenarios
- **Learning from test results** through result ingestion

### Scalability
- **Batch processing** for large document sets
- **Configurable chunk sizes** and overlap
- **Efficient vector storage** with ChromaDB
- **Memory-optimized context building**

### Monitoring
- **Comprehensive statistics** tracking
- **Performance metrics** (retrieval time, success rates)
- **Source attribution** for answers
- **Ranking explanations** for transparency

## Usage Examples

### Initialize and Setup
1. Navigate to RAG Workflow in the frontend
2. Click "Initialize now" if system not initialized
3. Go to "Ingest Data" tab
4. Enter path to your MERN application
5. Click "Ingest Application"

### Query the System
1. Go to "Query System" tab
2. Ask questions like:
   - "How do I test user authentication endpoints?"
   - "What are the validation rules for user registration?"
   - "Show me examples of error handling in this application"
3. Get AI-generated answers with source attribution

### Generate Tests
Use the `/workflow/rag/generate-tests` endpoint to create context-aware test cases based on your application's actual code and documentation.

## Benefits

1. **Contextual Accuracy** - Answers based on actual application code
2. **Improved Test Quality** - Tests informed by real implementation details
3. **Knowledge Retention** - System learns from previous test results
4. **Developer Productivity** - Quick answers to testing questions
5. **Comprehensive Coverage** - Understanding of entire MERN stack

This RAG implementation transforms your MERN AI Testing Platform into an intelligent system that can understand, learn from, and provide contextual assistance for testing MERN applications based on their actual codebase and documentation.