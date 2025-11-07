from __future__ import annotations

from typing import Iterable, List


def split_into_chunks(text: str, max_chars: int = 1200, overlap: int = 150) -> List[str]:
    if not text:
        return []
    paragraphs = [p.strip() for p in text.split("\n\n") if p.strip()]
    chunks: List[str] = []
    buffer = ""
    for para in paragraphs:
        if len(buffer) + len(para) + 2 <= max_chars:
            buffer = f"{buffer}\n\n{para}" if buffer else para
            continue
        if buffer:
            chunks.append(buffer)
        # slide window with overlap from previous buffer end
        if len(para) > max_chars:
            start = 0
            while start < len(para):
                end = min(start + max_chars, len(para))
                chunks.append(para[start:end])
                start = max(end - overlap, end)
            buffer = ""
        else:
            buffer = para
    if buffer:
        chunks.append(buffer)
    return chunks


