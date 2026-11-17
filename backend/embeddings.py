
from functools import lru_cache

from sentence_transformers import SentenceTransformer


MODEL_NAME = "intfloat/multilingual-e5-small"


@lru_cache(maxsize=1)
def get_embedding_model() -> SentenceTransformer:
    """Load and cache the embedding model."""
    return SentenceTransformer(MODEL_NAME)


def embed_documents(texts: list[str]):
    """Generate embeddings for document chunks."""
    model = get_embedding_model()

    prepared_texts = [
        f"passage: {text}" for text in texts
    ]

    return model.encode(
        prepared_texts,
        normalize_embeddings=True
    )


def embed_query(query: str):
    """Generate an embedding for a search query."""
    model = get_embedding_model()

    return model.encode(
        f"query: {query}",
        normalize_embeddings=True
    )
