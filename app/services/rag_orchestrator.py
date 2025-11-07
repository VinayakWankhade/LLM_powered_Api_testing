"""
RAG Orchestrator service that coordinates the complete RAG workflow.
Implements the complete workflow shown in the diagram:
User Query -> Embedding Model -> Vector DB -> Top-k Retrieval -> Re-ranker -> LLM -> Answer
"""

from typing import List, Dict, Any, Optional, Tuple, Union
from datetime import datetime
import json
import asyncio

from app.services.embeddings import EmbeddingService
from app.services.knowledge_base import KnowledgeBase
from app.services.reranker import RerankerService
from app.services.generation import GenerationService
from app.services.document_ingestion import DocumentIngestionPipeline
from app.schemas.tests import TestCase


class RAGOrchestrator:
    """
    RAG Orchestrator implementing the complete workflow from the diagram.
    Coordinates all RAG components for MERN AI Testing Platform.
    """
    
    def __init__(
        self,
        embedding_service: EmbeddingService = None,
        knowledge_base: KnowledgeBase = None,
        reranker: RerankerService = None,
        generation_service: GenerationService = None,
        ingestion_pipeline: DocumentIngestionPipeline = None
    ):
        # Initialize services
        self.embedding_service = embedding_service or EmbeddingService()
        self.knowledge_base = knowledge_base or KnowledgeBase(
            collection_name="mern_rag_kb",
            embedding_service=self.embedding_service
        )
        self.reranker = reranker or RerankerService()
        self.generation_service = generation_service or GenerationService(
            embed=self.embedding_service,
            knowledge_base=self.knowledge_base,
            reranker=self.reranker
        )
        self.ingestion_pipeline = ingestion_pipeline or DocumentIngestionPipeline()
        
        # RAG workflow statistics
        self.stats = {
            'total_queries': 0,
            'successful_retrievals': 0,
            'failed_retrievals': 0,
            'average_retrieval_time': 0,
            'knowledge_base_size': 0
        }
    
    async def initialize(self) -> Dict[str, Any]:
        """Initialize the RAG system and return status."""
        try:
            # Get knowledge base statistics
            kb_stats = await self.knowledge_base.get_stats()
            self.stats['knowledge_base_size'] = kb_stats.get('total_entries', 0)
            
            return {
                'status': 'initialized',
                'embedding_model': self.embedding_service.model_name,
                'embedding_dimension': self.embedding_service.get_embedding_dimension(),
                'knowledge_base_stats': kb_stats,
                'reranker_enabled': True,
                'ingestion_pipeline_ready': True
            }
        except Exception as e:
            return {
                'status': 'error',
                'error': str(e)
            }
    
    async def ingest_mern_application(self, app_path: str) -> Dict[str, Any]:
        """
        Ingest a MERN application into the RAG system.
        This populates the Vector DB with chunked documents.
        """
        start_time = datetime.utcnow()
        
        try:
            # Step 1: Document chunking and processing
            chunks = await self.ingestion_pipeline.ingest_mern_application(app_path)
            
            if not chunks:
                return {
                    'status': 'error',
                    'message': 'No documents found to ingest',
                    'chunks_processed': 0
                }
            
            # Step 2: Convert to knowledge base format
            kb_documents = self.ingestion_pipeline.chunks_to_knowledge_base_format(chunks)
            
            # Step 3: Ingest into vector database
            ingested_ids = await self.knowledge_base.ingest_documents(kb_documents)
            
            # Step 4: Update statistics
            processing_time = (datetime.utcnow() - start_time).total_seconds()
            
            return {
                'status': 'success',
                'chunks_processed': len(chunks),
                'documents_ingested': len(ingested_ids),
                'processing_time_seconds': processing_time,
                'source_types': list(set(chunk.source_type for chunk in chunks)),
                'ingestion_summary': self._create_ingestion_summary(chunks)
            }
            
        except Exception as e:
            return {
                'status': 'error',
                'error': str(e),
                'processing_time_seconds': (datetime.utcnow() - start_time).total_seconds()
            }
    
    def _create_ingestion_summary(self, chunks) -> Dict[str, Any]:
        """Create summary of ingested documents."""
        summary = {
            'by_source_type': {},
            'by_file_type': {},
            'total_content_length': 0
        }
        
        for chunk in chunks:
            # Count by source type
            source_type = chunk.source_type
            if source_type not in summary['by_source_type']:
                summary['by_source_type'][source_type] = 0
            summary['by_source_type'][source_type] += 1
            
            # Count by file type
            file_type = chunk.metadata.get('file_type', 'unknown')
            if file_type not in summary['by_file_type']:
                summary['by_file_type'][file_type] = 0
            summary['by_file_type'][file_type] += 1
            
            # Sum content length
            summary['total_content_length'] += len(chunk.content)
        
        return summary
    
    async def query_rag_system(
        self,
        query: str,
        context: Optional[Dict[str, Any]] = None,
        max_results: int = 5,
        include_ranking_details: bool = False
    ) -> Dict[str, Any]:
        """
        Query the RAG system following the complete workflow:
        1. User Question -> Embedding Model -> Vector Embeddings
        2. Vector DB -> Top-k Retrieval
        3. Re-ranker Model -> Reranked Chunks
        4. Context + Query -> LLM -> Answer
        """
        start_time = datetime.utcnow()
        self.stats['total_queries'] += 1
        
        try:
            # Step 1: Generate query embedding
            query_embedding = self.embedding_service.embed_query(query)
            
            # Step 2: Retrieve top-k chunks from vector database
            initial_results = await self.knowledge_base.retrieve_top_k(
                query, k=max_results * 2  # Get more for reranking
            )
            
            if not initial_results:
                self.stats['failed_retrievals'] += 1
                return {
                    'status': 'no_results',
                    'message': 'No relevant documents found',
                    'query': query,
                    'retrieved_chunks': [],
                    'processing_time_seconds': (datetime.utcnow() - start_time).total_seconds()
                }
            
            # Step 3: Apply reranking for better relevance
            reranked_docs = await self.reranker.rerank_documents(
                query, initial_results, top_k=max_results
            )
            
            # Step 4: Build context for LLM
            context_info = await self._build_llm_context(query, reranked_docs)
            
            # Step 5: Generate answer using LLM with context
            answer = await self._generate_contextual_answer(query, context_info, context)
            
            # Update statistics
            processing_time = (datetime.utcnow() - start_time).total_seconds()
            self.stats['successful_retrievals'] += 1
            self._update_average_retrieval_time(processing_time)
            
            # Prepare response
            response = {
                'status': 'success',
                'query': query,
                'answer': answer,
                'retrieved_chunks': len(initial_results),
                'reranked_chunks': len(reranked_docs),
                'context_length': len(context_info.get('context', '')),
                'processing_time_seconds': processing_time,
                'sources': self._extract_sources(reranked_docs)
            }
            
            # Add detailed ranking information if requested
            if include_ranking_details:
                response['ranking_details'] = [
                    self.reranker.get_ranking_explanation(doc)
                    for doc in reranked_docs[:3]  # Top 3 explanations
                ]
            
            return response
            
        except Exception as e:
            self.stats['failed_retrievals'] += 1
            return {
                'status': 'error',
                'error': str(e),
                'query': query,
                'processing_time_seconds': (datetime.utcnow() - start_time).total_seconds()
            }
    
    async def _build_llm_context(self, query: str, reranked_docs) -> Dict[str, Any]:
        """Build context for LLM from reranked documents."""
        context_parts = []
        source_info = []
        
        for doc in reranked_docs:
            # Add document content
            context_parts.append(doc.text)
            
            # Add source information
            source_info.append({
                'id': doc.id,
                'source_type': doc.metadata.get('source_type', 'unknown'),
                'file': doc.metadata.get('source_file', 'unknown'),
                'score': doc.rerank_score
            })
        
        return {
            'context': '\n\n---\n\n'.join(context_parts),
            'sources': source_info,
            'total_length': sum(len(part) for part in context_parts),
            'document_count': len(reranked_docs)
        }
    
    async def _generate_contextual_answer(
        self,
        query: str,
        context_info: Dict[str, Any],
        additional_context: Optional[Dict[str, Any]] = None
    ) -> str:
        """Generate contextual answer using the LLM."""
        try:
            if not self.generation_service.client:
                # Fallback when LLM is not available
                return self._generate_fallback_answer(query, context_info)
            
            # Build enhanced prompt with context
            system_prompt = """You are an expert API testing assistant for MERN applications. 
            Use the provided context from the knowledge base to give accurate, helpful answers about API testing, 
            code analysis, and MERN application development. Reference specific information from the context when possible."""
            
            context_text = context_info.get('context', '')
            sources = context_info.get('sources', [])
            
            user_prompt = f"""Context from knowledge base:
{context_text}

User question: {query}

Provide a comprehensive answer using the context information. If the context doesn't contain enough information, say so and provide general guidance."""
            
            # Add additional context if provided
            if additional_context:
                user_prompt += f"\n\nAdditional context: {json.dumps(additional_context, indent=2)}"
            
            response = self.generation_service.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.3,
                max_tokens=1500
            )
            
            answer = response.choices[0].message.content
            
            # Add source attribution
            if sources:
                source_list = "\n\nSources used:\n"
                for i, source in enumerate(sources[:3], 1):
                    source_list += f"{i}. {source.get('file', 'Unknown')} ({source.get('source_type', 'unknown')})"
                answer += source_list
            
            return answer
            
        except Exception as e:
            print(f"Error generating contextual answer: {e}")
            return self._generate_fallback_answer(query, context_info)
    
    def _generate_fallback_answer(self, query: str, context_info: Dict[str, Any]) -> str:
        """Generate fallback answer when LLM is unavailable."""
        context = context_info.get('context', '')
        source_count = context_info.get('document_count', 0)
        
        if context:
            # Extract key information from context
            key_points = context[:500] + "..." if len(context) > 500 else context
            return f"""Based on the available documentation ({source_count} sources), here's what I found related to '{query}':

{key_points}

This information was extracted from the MERN application's codebase and documentation. For more detailed assistance, please ensure the LLM service is available."""
        else:
            return f"I found {source_count} relevant documents for '{query}', but couldn't process them without the LLM service. Please ensure all RAG components are properly configured."
    
    def _extract_sources(self, reranked_docs) -> List[Dict[str, Any]]:
        """Extract source information from reranked documents."""
        sources = []
        for doc in reranked_docs:
            sources.append({
                'file': doc.metadata.get('source_file', 'unknown'),
                'type': doc.metadata.get('source_type', 'unknown'),
                'score': round(doc.rerank_score, 3),
                'chunk_id': doc.id
            })
        return sources
    
    def _update_average_retrieval_time(self, new_time: float):
        """Update running average of retrieval times."""
        if self.stats['successful_retrievals'] == 1:
            self.stats['average_retrieval_time'] = new_time
        else:
            # Running average formula
            current_avg = self.stats['average_retrieval_time']
            count = self.stats['successful_retrievals']
            self.stats['average_retrieval_time'] = (current_avg * (count - 1) + new_time) / count
    
    async def generate_tests_with_rag(
        self,
        query: str,
        endpoint: str = None,
        method: str = None,
        parameters: Dict[str, Any] = None,
        target_count: int = 8
    ) -> Tuple[List[TestCase], Dict[str, Any]]:
        """Generate test cases using RAG-enhanced generation."""
        return await self.generation_service.generate_with_rag(
            query=query,
            endpoint=endpoint,
            method=method,
            parameters=parameters,
            target_count=target_count
        )
    
    async def ingest_test_results(self, test_results: Dict[str, Any]) -> Dict[str, Any]:
        """Ingest test execution results into the RAG system."""
        try:
            # Process test results into chunks
            chunks = await self.ingestion_pipeline.ingest_test_results(test_results)
            
            if not chunks:
                return {
                    'status': 'no_data',
                    'message': 'No test result data to ingest'
                }
            
            # Convert to knowledge base format and ingest
            kb_documents = self.ingestion_pipeline.chunks_to_knowledge_base_format(chunks)
            ingested_ids = await self.knowledge_base.ingest_documents(kb_documents)
            
            return {
                'status': 'success',
                'test_chunks_ingested': len(chunks),
                'ingested_ids': len(ingested_ids),
                'result_types': list(set(chunk.metadata.get('type') for chunk in chunks))
            }
            
        except Exception as e:
            return {
                'status': 'error',
                'error': str(e)
            }
    
    async def get_rag_stats(self) -> Dict[str, Any]:
        """Get comprehensive RAG system statistics."""
        kb_stats = await self.knowledge_base.get_stats()
        
        return {
            'workflow_stats': self.stats,
            'knowledge_base_stats': kb_stats,
            'embedding_model': self.embedding_service.model_name,
            'embedding_dimension': self.embedding_service.get_embedding_dimension(),
            'reranker_weights': self.reranker.ranking_weights,
            'system_status': 'operational' if kb_stats['total_entries'] > 0 else 'empty'
        }
    
    async def search_knowledge_base(
        self,
        query: str,
        filters: Optional[Dict[str, Any]] = None,
        limit: int = 10
    ) -> Dict[str, Any]:
        """Search the knowledge base directly without LLM generation."""
        try:
            results = await self.knowledge_base.retrieve_with_reranking(
                query, k=limit*2, final_k=limit, filters=filters
            )
            
            return {
                'status': 'success',
                'query': query,
                'results_count': len(results),
                'results': [
                    {
                        'id': result['id'],
                        'content': result['text'][:200] + '...' if len(result['text']) > 200 else result['text'],
                        'source': result['metadata'].get('source_file', 'unknown'),
                        'type': result['metadata'].get('source_type', 'unknown'),
                        'score': result.get('rerank_score', result.get('distance', 0))
                    }
                    for result in results
                ]
            }
            
        except Exception as e:
            return {
                'status': 'error',
                'error': str(e)
            }
