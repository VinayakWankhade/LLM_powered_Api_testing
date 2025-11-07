from typing import Iterable, List, Optional, Dict, Any
import numpy as np
from sentence_transformers import SentenceTransformer
import openai
import hashlib
from datetime import datetime

class EmbeddingService:
    """Enhanced embedding service for RAG implementation following the diagram workflow."""
    
    def __init__(self, model_name: str = "all-MiniLM-L6-v2", use_openai: bool = False, openai_client=None):
        self.model_name = model_name
        self.use_openai = use_openai
        self.openai_client = openai_client
        self.model = None  # Initialize lazily
        self.embedding_dim = 384 if not use_openai else 1536  # OpenAI text-embedding-ada-002 dimension
        
    def _ensure_model(self):
        if self.model is None:
            try:
                self.model = SentenceTransformer(self.model_name)
            except Exception:
                # Fallback for development without heavy dependencies
                self.model = None
    
    def get_embeddings(self, texts: List[str]) -> List[np.ndarray]:
        """Generate embeddings for a list of texts using the configured model."""
        if self.use_openai and self.openai_client:
            return self._get_openai_embeddings(texts)
        else:
            return self._get_sentence_transformer_embeddings(texts)
    
    def _get_openai_embeddings(self, texts: List[str]) -> List[np.ndarray]:
        """Generate embeddings using OpenAI's API."""
        try:
            response = self.openai_client.embeddings.create(
                model="text-embedding-ada-002",
                input=texts
            )
            embeddings = [np.array(item.embedding) for item in response.data]
            return embeddings
        except Exception as e:
            print(f"OpenAI embedding error: {e}")
            # Fallback to sentence transformers
            return self._get_sentence_transformer_embeddings(texts)
    
    def _get_sentence_transformer_embeddings(self, texts: List[str]) -> List[np.ndarray]:
        """Generate embeddings using sentence transformers."""
        self._ensure_model()
        if self.model is None:
            # Fallback: hash-based pseudo-embedding
            return [np.array([(hash(t) % 1000) / 1000.0 for _ in range(self.embedding_dim)]) for t in texts]
        
        embeddings = self.model.encode(texts, convert_to_tensor=True)
        return embeddings.cpu().numpy() if hasattr(embeddings, 'cpu') else embeddings.numpy()
    
    def get_embedding(self, text: str) -> np.ndarray:
        """Generate embedding for a single text."""
        return self.get_embeddings([text])[0]

    def bulk_embed(self, texts: List[str], batch_size: int = 32) -> List[np.ndarray]:
        """Generate embeddings for a large list of texts using batching."""
        all_embeddings = []
        for i in range(0, len(texts), batch_size):
            batch = texts[i:i + batch_size]
            batch_embeddings = self.get_embeddings(batch)
            all_embeddings.extend(batch_embeddings)
        return all_embeddings

    def embed(self, texts: Iterable[str]) -> List[List[float]]:
        """Compatibility method for the old interface."""
        embeddings = self.get_embeddings(list(texts))
        return [e.tolist() for e in embeddings]
    
    def embed_query(self, query: str) -> np.ndarray:
        """Generate embedding for a single query - used for retrieval."""
        return self.get_embedding(query)
    
    def compute_similarity(self, embedding1: np.ndarray, embedding2: np.ndarray) -> float:
        """Compute cosine similarity between two embeddings."""
        # Normalize the embeddings
        norm1 = np.linalg.norm(embedding1)
        norm2 = np.linalg.norm(embedding2)
        
        if norm1 == 0 or norm2 == 0:
            return 0.0
        
        # Cosine similarity
        similarity = np.dot(embedding1, embedding2) / (norm1 * norm2)
        return float(similarity)
    
    def embed_documents_with_metadata(self, documents: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Embed documents and return with embeddings and metadata."""
        texts = [doc.get('content', '') for doc in documents]
        embeddings = self.get_embeddings(texts)
        
        enriched_docs = []
        for i, (doc, embedding) in enumerate(zip(documents, embeddings)):
            enriched_doc = doc.copy()
            enriched_doc.update({
                'embedding': embedding.tolist(),
                'embedding_model': self.model_name,
                'embedding_timestamp': datetime.utcnow().isoformat(),
                'embedding_id': self._generate_embedding_id(doc.get('content', ''), i)
            })
            enriched_docs.append(enriched_doc)
        
        return enriched_docs
    
    def _generate_embedding_id(self, content: str, index: int) -> str:
        """Generate unique ID for embedding based on content hash."""
        content_hash = hashlib.md5(content.encode()).hexdigest()[:8]
        timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
        return f"emb_{timestamp}_{index}_{content_hash}"
    
    def get_embedding_dimension(self) -> int:
        """Get the dimension of embeddings produced by this service."""
        return self.embedding_dim


# Alias for backward compatibility
EmbeddingModel = EmbeddingService
