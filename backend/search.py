
import numpy as np

from backend.embeddings import embed_documents, embed_query


def semantic_search(
    query: str,
    chunks: list[dict],
    top_k: int = 3
) -> list[dict]:
    """Find the most relevant document chunks."""

    if not query.strip():
        raise ValueError("Search query cannot be empty")

    if top_k <= 0:
        raise ValueError("top_k must be positive")

    if not chunks:
        return []

    texts = [chunk["text"] for chunk in chunks]

    document_vectors = embed_documents(texts)
    query_vector = embed_query(query)

    scores = document_vectors @ query_vector

    ranked_indices = np.argsort(scores)[::-1][:top_k]

    results = []

    for index in ranked_indices:
        chunk = chunks[int(index)]

        results.append({
            "chunk_id": chunk["chunk_id"],
            "page": chunk["page"],
            "score": round(float(scores[index]), 4),
            "text": chunk["text"]
        })

    return results
