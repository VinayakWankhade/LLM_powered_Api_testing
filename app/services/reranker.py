"""
Re-ranker Model service for improving retrieval quality in RAG implementation.
Implements the Re-ranker Model component from the diagram workflow.
"""

from typing import List, Dict, Any, Optional, Tuple
import re
from datetime import datetime
import numpy as np
from dataclasses import dataclass


@dataclass
class RankedDocument:
    """Represents a document with ranking scores."""
    id: str
    text: str
    metadata: Dict[str, Any]
    original_score: float
    rerank_score: float
    ranking_factors: Dict[str, float]


class RerankerService:
    """Advanced re-ranking service for RAG retrieval optimization."""
    
    def __init__(self, use_cross_encoder: bool = False):
        self.use_cross_encoder = use_cross_encoder
        self.cross_encoder_model = None
        
        # Ranking weights for different factors
        self.ranking_weights = {
            'semantic_similarity': 0.4,
            'keyword_overlap': 0.25,
            'freshness': 0.15,
            'document_quality': 0.1,
            'domain_relevance': 0.1
        }
    
    def _ensure_cross_encoder(self):
        """Initialize cross-encoder model if needed."""
        if self.use_cross_encoder and self.cross_encoder_model is None:
            try:
                from sentence_transformers import CrossEncoder
                self.cross_encoder_model = CrossEncoder('cross-encoder/ms-marco-MiniLM-L-6-v2')
            except ImportError:
                print("Warning: sentence-transformers not available for cross-encoding")
                self.use_cross_encoder = False
    
    async def rerank_documents(
        self,
        query: str,
        documents: List[Dict[str, Any]],
        top_k: int = 5,
        custom_weights: Optional[Dict[str, float]] = None
    ) -> List[RankedDocument]:
        """
        Rerank documents based on multiple relevance factors.
        
        Args:
            query: The search query
            documents: List of retrieved documents with metadata
            top_k: Number of top documents to return
            custom_weights: Custom weights for ranking factors
            
        Returns:
            List of reranked documents with scores
        """
        if not documents:
            return []
        
        # Use custom weights if provided
        weights = custom_weights or self.ranking_weights
        
        ranked_docs = []
        
        for doc in documents:
            # Calculate various ranking factors
            factors = await self._calculate_ranking_factors(query, doc)
            
            # Combine scores using weighted average
            rerank_score = sum(
                factors.get(factor, 0) * weight
                for factor, weight in weights.items()
            )
            
            ranked_doc = RankedDocument(
                id=doc.get('id', ''),
                text=doc.get('text', ''),
                metadata=doc.get('metadata', {}),
                original_score=doc.get('distance', 1.0),
                rerank_score=rerank_score,
                ranking_factors=factors
            )
            
            ranked_docs.append(ranked_doc)
        
        # Sort by rerank score (higher is better)
        ranked_docs.sort(key=lambda x: x.rerank_score, reverse=True)
        
        return ranked_docs[:top_k]
    
    async def _calculate_ranking_factors(self, query: str, document: Dict[str, Any]) -> Dict[str, float]:
        """Calculate various ranking factors for a document."""
        text = document.get('text', '')
        metadata = document.get('metadata', {})
        
        factors = {}
        
        # 1. Semantic Similarity (from original retrieval)
        original_distance = document.get('distance', 1.0)
        factors['semantic_similarity'] = max(0, 1 - original_distance)
        
        # 2. Keyword Overlap
        factors['keyword_overlap'] = self._calculate_keyword_overlap(query, text)
        
        # 3. Document Freshness
        factors['freshness'] = self._calculate_freshness_score(metadata)
        
        # 4. Document Quality
        factors['document_quality'] = self._calculate_quality_score(text, metadata)
        
        # 5. Domain Relevance
        factors['domain_relevance'] = self._calculate_domain_relevance(query, text, metadata)
        
        # 6. Cross-encoder score (if available)
        if self.use_cross_encoder:
            factors['cross_encoder'] = await self._get_cross_encoder_score(query, text)
        
        return factors
    
    def _calculate_keyword_overlap(self, query: str, text: str) -> float:
        """Calculate keyword overlap score between query and text."""
        query_terms = set(self._extract_keywords(query.lower()))
        text_terms = set(self._extract_keywords(text.lower()))
        
        if not query_terms:
            return 0.0
        
        # Calculate Jaccard similarity
        intersection = len(query_terms.intersection(text_terms))
        union = len(query_terms.union(text_terms))
        
        if union == 0:
            return 0.0
        
        jaccard = intersection / union
        
        # Also consider term frequency
        overlap_ratio = intersection / len(query_terms)
        
        # Combine Jaccard and overlap ratio
        return (jaccard + overlap_ratio) / 2
    
    def _extract_keywords(self, text: str) -> List[str]:
        """Extract keywords from text, filtering out stop words."""
        # Simple keyword extraction - remove common stop words
        stop_words = {
            'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
            'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
            'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
            'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those'
        }
        
        # Extract alphanumeric words
        words = re.findall(r'\b[a-zA-Z0-9]+\b', text)
        keywords = [word for word in words if word.lower() not in stop_words and len(word) > 2]
        
        return keywords
    
    def _calculate_freshness_score(self, metadata: Dict[str, Any]) -> float:
        """Calculate document freshness score."""
        timestamp_fields = ['timestamp', 'created_at', 'updated_at', 'ingestion_timestamp']
        
        for field in timestamp_fields:
            if field in metadata:
                try:
                    # Assume ISO format timestamp
                    doc_time = datetime.fromisoformat(metadata[field].replace('Z', '+00:00'))
                    now = datetime.utcnow().replace(tzinfo=doc_time.tzinfo)
                    
                    # Calculate age in days
                    age_days = (now - doc_time).days
                    
                    # Fresher documents get higher scores
                    if age_days <= 1:
                        return 1.0
                    elif age_days <= 7:
                        return 0.8
                    elif age_days <= 30:
                        return 0.6
                    elif age_days <= 90:
                        return 0.4
                    else:
                        return 0.2
                        
                except (ValueError, AttributeError):
                    continue
        
        # Default score if no timestamp found
        return 0.5
    
    def _calculate_quality_score(self, text: str, metadata: Dict[str, Any]) -> float:
        """Calculate document quality score based on various factors."""
        if not text:
            return 0.0
        
        score = 0.5  # Base score
        
        # Length factor (not too short, not too long)
        length = len(text)
        if 100 <= length <= 2000:
            score += 0.2
        elif 50 <= length < 100 or 2000 < length <= 5000:
            score += 0.1
        
        # Structure indicators
        if any(indicator in text.lower() for indicator in ['api', 'endpoint', 'test', 'response']):
            score += 0.2
        
        # Code or technical content indicators
        if any(indicator in text for indicator in ['{', '}', 'http', 'json', 'function']):
            score += 0.1
        
        # Metadata quality indicators
        if metadata.get('source') == 'official_docs':
            score += 0.2
        elif metadata.get('source') == 'code_comments':
            score += 0.1
        
        if metadata.get('confidence_score'):
            try:
                confidence = float(metadata['confidence_score'])
                score += confidence * 0.2
            except (ValueError, TypeError):
                pass
        
        return min(1.0, score)
    
    def _calculate_domain_relevance(self, query: str, text: str, metadata: Dict[str, Any]) -> float:
        """Calculate domain-specific relevance score."""
        # MERN/API testing specific terms
        domain_terms = {
            'api', 'endpoint', 'test', 'testing', 'response', 'request', 'http',
            'json', 'rest', 'mern', 'mongodb', 'express', 'react', 'node',
            'validation', 'security', 'performance', 'functional'
        }
        
        query_lower = query.lower()
        text_lower = text.lower()
        
        # Check for domain terms in query and text
        query_domain_terms = sum(1 for term in domain_terms if term in query_lower)
        text_domain_terms = sum(1 for term in domain_terms if term in text_lower)
        
        if query_domain_terms == 0:
            return 0.5  # Neutral if no domain terms in query
        
        # Score based on domain term density
        text_words = len(text_lower.split())
        if text_words > 0:
            domain_density = text_domain_terms / text_words
            return min(1.0, domain_density * 10)  # Scale up density
        
        return 0.5
    
    async def _get_cross_encoder_score(self, query: str, text: str) -> float:
        """Get cross-encoder similarity score if available."""
        if not self.use_cross_encoder:
            return 0.5
        
        self._ensure_cross_encoder()
        
        if self.cross_encoder_model is None:
            return 0.5
        
        try:
            # Cross-encoder takes query-document pairs
            score = self.cross_encoder_model.predict([(query, text)])
            return float(score[0]) if isinstance(score, (list, np.ndarray)) else float(score)
        except Exception as e:
            print(f"Cross-encoder error: {e}")
            return 0.5
    
    def get_ranking_explanation(self, ranked_doc: RankedDocument) -> Dict[str, Any]:
        """Get detailed explanation of ranking factors for a document."""
        return {
            'document_id': ranked_doc.id,
            'final_score': ranked_doc.rerank_score,
            'original_score': ranked_doc.original_score,
            'ranking_factors': ranked_doc.ranking_factors,
            'weights_used': self.ranking_weights,
            'top_factors': sorted(
                ranked_doc.ranking_factors.items(),
                key=lambda x: x[1],
                reverse=True
            )[:3]
        }