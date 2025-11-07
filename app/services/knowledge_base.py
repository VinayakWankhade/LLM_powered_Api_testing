"""
Knowledge base service using ChromaDB for storing and retrieving embeddings.
Enhanced with feedback loop integration and temporal metadata.
"""

from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional, Union

import chromadb  # type: ignore
from chromadb.config import Settings
try:
    from chromadb.api.types import (  # type: ignore
        Documents,
        Embeddings,
        IDs,
        Metadatas,
        QueryResult
    )
except ImportError:
    # Fallback for different ChromaDB versions
    Documents = list
    Embeddings = list
    IDs = list
    Metadatas = list
    QueryResult = dict


class KnowledgeBase:
    """Enhanced Knowledge Base serving as Vector Database for RAG implementation."""
    
    def __init__(self, collection_name: str = "api_kb", embedding_service=None) -> None:
        self.embedding_service = embedding_service
        
        # Initialize ChromaDB client with persistence
        try:
            self._client = chromadb.PersistentClient(path=".chroma")
        except Exception:
            # Fallback for older ChromaDB versions
            self._client = chromadb.Client(Settings(
                chroma_db_impl="duckdb+parquet",
                persist_directory=".chroma"
            ))
        
        # Get or create collection with metadata
        self._collection = self._client.get_or_create_collection(
            name=collection_name,
            metadata={
                "creation_time": datetime.utcnow().isoformat(),
                "description": "RAG-enabled knowledge base for MERN testing platform",
                "embedding_model": embedding_service.model_name if embedding_service else "default",
                "rag_enabled": True
            }
        )

    async def add_entry(
        self,
        text: str,
        embedding: List[float],
        metadata: Optional[Dict[str, Any]] = None
    ) -> str:
        """Add a new entry to the knowledge base with timestamp."""
        entry_id = f"entry_{datetime.utcnow().timestamp()}"
        
        # Ensure metadata has timestamp
        if metadata is None:
            metadata = {}
        metadata["timestamp"] = datetime.utcnow().isoformat()
        
        self._collection.add(
            embeddings=[embedding],
            documents=[text],
            metadatas=[metadata],
            ids=[entry_id]
        )
        
        return entry_id

    def add(
        self,
        ids: Union[str, List[str]],
        documents: Union[str, List[str]],
        embeddings: Union[List[float], List[List[float]]],
        metadatas: Optional[Union[Dict[str, Any], List[Dict[str, Any]]]] = None
    ) -> None:
        """Legacy add method with enhanced metadata handling."""
        # Convert single items to lists
        if isinstance(ids, str):
            ids = [ids]
        if isinstance(documents, str):
            documents = [documents]
        if isinstance(embeddings[0], (int, float)):
            embeddings = [embeddings]
        if isinstance(metadatas, dict):
            metadatas = [metadatas]
        
        # Add timestamps to metadata
        if metadatas is None:
            metadatas = [{"timestamp": datetime.utcnow().isoformat()} for _ in ids]
        else:
            metadatas = [
                {**m, "timestamp": datetime.utcnow().isoformat()}
                for m in metadatas
            ]
        
        self._collection.add(
            ids=ids,
            documents=documents,
            embeddings=embeddings,
            metadatas=metadatas
        )

    async def search(
        self,
        query: str,
        query_embeddings: Optional[List[float]] = None,
        limit: int = 5,
        metadata_filter: Optional[Dict[str, Any]] = None
    ) -> List[Dict[str, Any]]:
        """Enhanced search with query text support."""
        results = self._collection.query(
            query_texts=[query] if query_embeddings is None else None,
            query_embeddings=[query_embeddings] if query_embeddings is not None else None,
            n_results=limit,
            where=metadata_filter
        )
        
        return self._format_query_results(results)

    def query(
        self,
        query_embeddings: Embeddings,
        n_results: int = 5,
        where: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Legacy query method."""
        return self._collection.query(
            query_embeddings=query_embeddings,
            n_results=n_results,
            where=where
        )

    async def get_by_endpoint(
        self,
        endpoint: str,
        limit: int = 10
    ) -> List[Dict[str, Any]]:
        """Get entries related to a specific endpoint."""
        return await self.search(
            query=endpoint,
            limit=limit,
            metadata_filter={"endpoint": endpoint}
        )

    async def get_recent_entries(
        self,
        hours: int = 24,
        limit: int = 100
    ) -> List[Dict[str, Any]]:
        """Get recent entries from the knowledge base."""
        cutoff_time = (datetime.utcnow() - timedelta(hours=hours)).isoformat()
        
        where = {
            "timestamp": {
                "$gt": cutoff_time
            }
        }
        
        results = self._collection.get(
            where=where,
            limit=limit
        )
        
        return self._format_get_results(results)

    async def get_stats(self) -> Dict[str, Any]:
        """Get statistics about the knowledge base."""
        all_entries = self._collection.get()
        
        # Count unique endpoints
        unique_endpoints = set()
        for metadata in all_entries['metadatas']:
            if metadata and 'endpoint' in metadata:
                unique_endpoints.add(metadata['endpoint'])
        
        # Get recent entries count
        recent_cutoff = (datetime.utcnow() - timedelta(hours=24)).isoformat()
        recent_count = sum(
            1 for metadata in all_entries['metadatas']
            if metadata and metadata.get('timestamp', '') > recent_cutoff
        )
        
        return {
            "total_entries": len(all_entries['ids']),
            "unique_endpoints": len(unique_endpoints),
            "recent_entries": recent_count,
            "collection_created": self._collection.metadata.get("creation_time")
        }

    async def cleanup_old_entries(self, days: int = 30) -> int:
        """Remove entries older than specified days."""
        cutoff_time = (datetime.utcnow() - timedelta(days=days)).isoformat()
        
        where = {
            "timestamp": {
                "$lt": cutoff_time
            }
        }
        
        old_entries = self._collection.get(where=where)
        if old_entries['ids']:
            self._collection.delete(ids=old_entries['ids'])
        
        return len(old_entries['ids'])

    def _format_query_results(self, results: QueryResult) -> List[Dict[str, Any]]:
        """Format ChromaDB query results into a standardized structure."""
        entries = []
        if not results['ids']:
            return entries
        
        for i in range(len(results['ids'][0])):
            entries.append({
                'id': results['ids'][0][i],
                'text': results['documents'][0][i],
                'metadata': results['metadatas'][0][i] if results['metadatas'] else {},
                'distance': results['distances'][0][i] if 'distances' in results else None
            })
        
        return entries

    def _format_get_results(self, results: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Format ChromaDB get results into a standardized structure."""
        entries = []
        for i in range(len(results['ids'])):
            entries.append({
                'id': results['ids'][i],
                'text': results['documents'][i],
                'metadata': results['metadatas'][i] if results['metadatas'] else {}
            })
        
        return entries
    
    async def ingest_documents(self, documents: List[Dict[str, Any]]) -> List[str]:
        """Ingest documents into the vector database for RAG retrieval."""
        if not self.embedding_service:
            raise ValueError("Embedding service is required for document ingestion")
        
        # Generate embeddings for documents
        enriched_docs = self.embedding_service.embed_documents_with_metadata(documents)
        
        ids = []
        texts = []
        embeddings = []
        metadatas = []
        
        for doc in enriched_docs:
            ids.append(doc['embedding_id'])
            texts.append(doc.get('content', ''))
            embeddings.append(doc['embedding'])
            
            # Prepare metadata
            metadata = doc.copy()
            metadata.pop('content', None)  # Remove content from metadata
            metadata.pop('embedding', None)  # Remove embedding from metadata
            metadata['ingestion_timestamp'] = datetime.utcnow().isoformat()
            metadatas.append(metadata)
        
        # Add to ChromaDB
        self._collection.add(
            ids=ids,
            documents=texts,
            embeddings=embeddings,
            metadatas=metadatas
        )
        
        return ids
    
    async def retrieve_top_k(self, query: str, k: int = 5, filters: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        """Retrieve top-k most similar documents for RAG."""
        if not self.embedding_service:
            # Fallback to text-based search
            return await self.search(query, limit=k, metadata_filter=filters)
        
        # Generate query embedding
        query_embedding = self.embedding_service.embed_query(query)
        
        # Search in vector database
        results = self._collection.query(
            query_embeddings=[query_embedding.tolist()],
            n_results=k,
            where=filters
        )
        
        return self._format_query_results(results)
    
    async def retrieve_with_reranking(self, query: str, k: int = 10, final_k: int = 5, filters: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        """Retrieve documents with reranking for improved relevance."""
        # First, get more results than needed
        initial_results = await self.retrieve_top_k(query, k=k, filters=filters)
        
        if not initial_results:
            return []
        
        # Simple reranking based on text similarity
        query_terms = set(query.lower().split())
        
        for result in initial_results:
            text = result.get('text', '').lower()
            # Calculate term overlap score
            text_terms = set(text.split())
            overlap_score = len(query_terms.intersection(text_terms)) / len(query_terms) if query_terms else 0
            
            # Combine with distance score (lower distance = higher similarity)
            distance = result.get('distance', 1.0)
            combined_score = (1 - distance) * 0.7 + overlap_score * 0.3
            result['rerank_score'] = combined_score
        
        # Sort by rerank score and return top results
        reranked = sorted(initial_results, key=lambda x: x.get('rerank_score', 0), reverse=True)
        return reranked[:final_k]
    
    async def get_context_for_query(self, query: str, max_context_length: int = 4000) -> Dict[str, Any]:
        """Get optimized context for RAG query processing."""
        # Retrieve relevant documents
        relevant_docs = await self.retrieve_with_reranking(query, k=10, final_k=5)
        
        # Build context string
        context_parts = []
        total_length = 0
        used_docs = []
        
        for doc in relevant_docs:
            text = doc.get('text', '')
            if total_length + len(text) <= max_context_length:
                context_parts.append(text)
                used_docs.append(doc)
                total_length += len(text)
            else:
                # Truncate the last document if needed
                remaining_space = max_context_length - total_length
                if remaining_space > 100:  # Only include if meaningful space left
                    truncated_text = text[:remaining_space] + "..."
                    context_parts.append(truncated_text)
                    doc_copy = doc.copy()
                    doc_copy['text'] = truncated_text
                    doc_copy['truncated'] = True
                    used_docs.append(doc_copy)
                break
        
        return {
            'context': '\n\n---\n\n'.join(context_parts),
            'source_documents': used_docs,
            'total_documents': len(used_docs),
            'context_length': total_length,
            'query': query
        }
