from __future__ import annotations

import re
from typing import Any, Dict, List, Tuple, Optional
from dataclasses import dataclass

import numpy as np  # type: ignore

from app.services.embeddings import EmbeddingService


@dataclass
class ContextDocument:
    """Enhanced document with metadata for context optimization."""
    content: str
    source: str
    relevance_score: float = 0.0
    quality_score: float = 0.0
    type_coverage: List[str] = None
    complexity_score: float = 0.0

    def __post_init__(self):
        if self.type_coverage is None:
            self.type_coverage = []


class ContextOptimizer:
    """Advanced RAG context optimizer for test generation."""
    
    def __init__(self, embed: EmbeddingService) -> None:
        self.embed = embed
        
        # Test type keywords for document classification
        self.type_keywords = {
            "functional": ["function", "endpoint", "api", "request", "response", "parameter", "valid", "invalid"],
            "security": ["auth", "security", "sql", "xss", "csrf", "injection", "privilege", "access", "token"],
            "performance": ["performance", "load", "stress", "concurrent", "timeout", "latency", "throughput"],
            "edge": ["edge", "boundary", "limit", "null", "empty", "invalid", "exception", "error"]
        }
        
        # Quality indicators
        self.quality_indicators = {
            "positive": ["example", "test", "case", "validation", "assertion", "expected", "should"],
            "negative": ["todo", "fixme", "deprecated", "obsolete", "temporary"]
        }

    def optimize_context(
        self, 
        query: str, 
        raw_documents: List[str], 
        endpoint: str, 
        method: str,
        max_context_length: int = 3000,
        diversity_weight: float = 0.3
    ) -> Tuple[List[str], Dict[str, Any]]:
        """Optimize context documents for test generation."""
        
        # Convert to enhanced documents
        documents = [ContextDocument(content=doc, source="kb") for doc in raw_documents]
        
        # Score documents
        self._score_relevance(query, endpoint, method, documents)
        self._score_quality(documents)
        self._classify_test_types(documents)
        self._score_complexity(documents)
        
        # Select optimal subset
        selected_docs, metadata = self._select_optimal_subset(
            documents, max_context_length, diversity_weight
        )
        
        # Reorder for optimal presentation
        reordered_docs = self._reorder_for_context(selected_docs, query)
        
        return [doc.content for doc in reordered_docs], metadata

    def _score_relevance(self, query: str, endpoint: str, method: str, documents: List[ContextDocument]) -> None:
        """Score documents based on relevance to query and endpoint."""
        # Create enhanced query with endpoint context
        enhanced_query = f"{method} {endpoint} {query}"
        
        # Get embeddings
        query_embedding = self.embed.embed([enhanced_query])[0]
        doc_embeddings = self.embed.embed([doc.content for doc in documents])
        
        # Calculate semantic similarity
        query_norm = query_embedding / (np.linalg.norm(query_embedding) + 1e-12)
        
        for i, doc in enumerate(documents):
            doc_norm = doc_embeddings[i] / (np.linalg.norm(doc_embeddings[i]) + 1e-12)
            semantic_sim = np.dot(query_norm, doc_norm)
            
            # Keyword-based relevance boost
            keyword_boost = self._calculate_keyword_relevance(doc.content, endpoint, method)
            
            # Final relevance score
            doc.relevance_score = float(semantic_sim * 0.7 + keyword_boost * 0.3)

    def _calculate_keyword_relevance(self, content: str, endpoint: str, method: str) -> float:
        """Calculate keyword-based relevance score."""
        content_lower = content.lower()
        score = 0.0
        
        # Endpoint/method mentions
        if endpoint.lower() in content_lower:
            score += 0.3
        if method.lower() in content_lower:
            score += 0.2
        
        # API-related terms
        api_terms = ["endpoint", "api", "request", "response", "parameter", "header"]
        matches = sum(1 for term in api_terms if term in content_lower)
        score += min(matches * 0.05, 0.3)
        
        return min(score, 1.0)

    def _score_quality(self, documents: List[ContextDocument]) -> None:
        """Score documents based on content quality indicators."""
        for doc in documents:
            content_lower = doc.content.lower()
            
            # Positive indicators
            positive_score = sum(
                content_lower.count(term) for term in self.quality_indicators["positive"]
            ) * 0.1
            
            # Negative indicators
            negative_score = sum(
                content_lower.count(term) for term in self.quality_indicators["negative"]
            ) * 0.2
            
            # Length penalty for very short or very long docs
            length = len(doc.content)
            length_score = 1.0
            if length < 50:
                length_score = length / 50.0
            elif length > 2000:
                length_score = max(0.5, 2000 / length)
            
            # Code/example bonus
            code_bonus = 0.2 if any(pattern in doc.content for pattern in ["```", "curl", "POST", "GET"]) else 0.0
            
            doc.quality_score = min(1.0, positive_score - negative_score + length_score + code_bonus)

    def _classify_test_types(self, documents: List[ContextDocument]) -> None:
        """Classify documents by test types they support."""
        for doc in documents:
            content_lower = doc.content.lower()
            
            for test_type, keywords in self.type_keywords.items():
                matches = sum(1 for keyword in keywords if keyword in content_lower)
                if matches >= 2:  # Threshold for classification
                    doc.type_coverage.append(test_type)

    def _score_complexity(self, documents: List[ContextDocument]) -> None:
        """Score documents based on technical complexity."""
        for doc in documents:
            content = doc.content
            
            # Technical terms
            technical_patterns = [
                r'\b\d{3}\b',  # HTTP status codes
                r'application/json',
                r'Bearer\s+\w+',  # Auth tokens
                r'\{[^}]*\}',  # JSON objects
                r'SELECT|INSERT|UPDATE|DELETE',  # SQL
                r'script|alert|onerror',  # XSS patterns
            ]
            
            complexity_score = 0.0
            for pattern in technical_patterns:
                matches = len(re.findall(pattern, content, re.IGNORECASE))
                complexity_score += matches * 0.1
            
            doc.complexity_score = min(1.0, complexity_score)

    def _select_optimal_subset(
        self, 
        documents: List[ContextDocument], 
        max_length: int, 
        diversity_weight: float
    ) -> Tuple[List[ContextDocument], Dict[str, Any]]:
        """Select optimal subset of documents using greedy algorithm with diversity."""
        
        if not documents:
            return [], {}
        
        # Sort by composite score
        scored_docs = []
        for doc in documents:
            composite_score = (
                doc.relevance_score * 0.4 +
                doc.quality_score * 0.3 +
                len(doc.type_coverage) * 0.15 +
                doc.complexity_score * 0.15
            )
            scored_docs.append((doc, composite_score))
        
        scored_docs.sort(key=lambda x: x[1], reverse=True)
        
        # Greedy selection with diversity
        selected = []
        current_length = 0
        type_coverage = set()
        
        for doc, score in scored_docs:
            doc_length = len(doc.content)
            
            # Check length constraint
            if current_length + doc_length > max_length and selected:
                break
            
            # Diversity bonus for new test types
            diversity_bonus = len(set(doc.type_coverage) - type_coverage) * diversity_weight
            adjusted_score = score + diversity_bonus
            
            # Add if beneficial or if we have space and need diversity
            if not selected or adjusted_score > 0.3:
                selected.append(doc)
                current_length += doc_length
                type_coverage.update(doc.type_coverage)
        
        # Ensure minimum quality
        selected = [doc for doc in selected if doc.relevance_score > 0.2]
        
        # Metadata for analysis
        metadata = {
            "total_documents": len(documents),
            "selected_documents": len(selected),
            "context_length": current_length,
            "type_coverage": list(type_coverage),
            "avg_relevance": np.mean([doc.relevance_score for doc in selected]) if selected else 0.0,
            "avg_quality": np.mean([doc.quality_score for doc in selected]) if selected else 0.0
        }
        
        return selected, metadata

    def _reorder_for_context(self, documents: List[ContextDocument], query: str) -> List[ContextDocument]:
        """Reorder documents for optimal context presentation."""
        if len(documents) <= 1:
            return documents
        
        # Separate by document types
        high_relevance = [doc for doc in documents if doc.relevance_score > 0.7]
        medium_relevance = [doc for doc in documents if 0.4 <= doc.relevance_score <= 0.7]
        background = [doc for doc in documents if doc.relevance_score < 0.4]
        
        # Order: high relevance first, then background for context, then medium
        reordered = []
        
        # Start with most relevant
        if high_relevance:
            reordered.extend(sorted(high_relevance, key=lambda x: x.relevance_score, reverse=True))
        
        # Add background context
        if background:
            reordered.extend(sorted(background, key=lambda x: x.quality_score, reverse=True))
        
        # Fill with medium relevance
        if medium_relevance:
            reordered.extend(sorted(medium_relevance, key=lambda x: x.relevance_score, reverse=True))
        
        return reordered

    def analyze_context_gaps(self, documents: List[ContextDocument], required_types: List[str]) -> Dict[str, Any]:
        """Analyze gaps in context coverage."""
        covered_types = set()
        for doc in documents:
            covered_types.update(doc.type_coverage)
        
        missing_types = set(required_types) - covered_types
        
        return {
            "covered_types": list(covered_types),
            "missing_types": list(missing_types),
            "coverage_percentage": len(covered_types) / len(required_types) if required_types else 1.0,
            "recommendations": self._generate_gap_recommendations(missing_types)
        }

    def _generate_gap_recommendations(self, missing_types: set) -> List[str]:
        """Generate recommendations for missing test type coverage."""
        recommendations = []
        
        if "functional" in missing_types:
            recommendations.append("Add API specification or example requests/responses")
        
        if "security" in missing_types:
            recommendations.append("Include security testing guidelines or vulnerability examples")
        
        if "performance" in missing_types:
            recommendations.append("Add performance benchmarks or load testing specifications")
        
        if "edge" in missing_types:
            recommendations.append("Include error handling documentation or edge case examples")
        
        return recommendations