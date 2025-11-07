from __future__ import annotations

from typing import Any, Dict, List, Optional

from app.services.embeddings import EmbeddingService
from app.services.knowledge_base import KnowledgeBase


class RetrievalService:
    def __init__(self, kb: KnowledgeBase, embed: EmbeddingService) -> None:
        self.kb = kb
        self.embed = embed

    def retrieve(self, query: str, k: int = 6, source: Optional[str] = None) -> Dict[str, Any]:
        vectors = self.embed.embed([query])
        where = {"source": source} if source else None
        result = self.kb.query(query_embeddings=vectors, n_results=k, where=where)
        return result


