
from backend.embeddings import embed_query
from backend.repository import search_similar_chunks


def retrieve_context(
    document_id: str,
    question: str,
    top_k: int = 3,
) -> dict:
    """Retrieve relevant chunks and prepare LLM context."""

    if not question.strip():
        raise ValueError("Question cannot be empty")

    # Generate embedding for the question
    query_embedding = embed_query(question)

    # Search stored vectors in PostgreSQL
    results = search_similar_chunks(
        document_id=document_id,
        query_embedding=query_embedding,
        top_k=top_k,
    )

    # Build context with source references
    context_parts = []
    sources = []

    for result in results:
        page = result["page"]
        chunk_id = result["chunk_id"]

        context_parts.append(
            f"[Source: page {page}, chunk {chunk_id}]\n"
            f"{result['text']}"
        )

        sources.append({
            "page": page,
            "chunk_id": chunk_id,
            "score": result["score"],
        })

    return {
        "question": question,
        "context": "\n\n---\n\n".join(context_parts),
        "sources": sources,
    }
