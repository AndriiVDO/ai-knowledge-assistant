from uuid import UUID

import numpy as np
from pgvector.psycopg import register_vector

from backend.database import get_connection


def save_document(
    document_id: str,
    filename: str,
    file_size: int,
    page_count: int,
    chunks: list[dict],
    embeddings: np.ndarray,
):
    """Save a document and its embeddings in PostgreSQL."""

    if len(chunks) != len(embeddings):
        raise ValueError("Number of chunks and embeddings must match")

    with get_connection() as connection:
        register_vector(connection)

        with connection.cursor() as cursor:
            cursor.execute(
                """
                INSERT INTO documents(id, filename, file_size, page_count)
                VALUES (%s, %s, %s, %s)
                ON CONFLICT (id)
                DO UPDATE SET
                filename = EXCLUDED.filename,
                file_size = EXCLUDED.file_size,
                page_count = EXCLUDED.page_count
                """,
                (
                    UUID(document_id),
                    filename,
                    file_size,
                    page_count,
                ),
            )

            cursor.execute(
                """
                DELETE FROM document_chunks
                WHERE document_id = %s
                """,
                (UUID(document_id),),
            )

            for chunk, embedding in zip(chunks, embeddings):
                cursor.execute(
                    """
                    INSERT INTO document_chunks
                        (
                            document_id,
                            chunk_index,
                            page_number,
                            content,
                            embedding
                        )
                    VALUES (%s, %s, %s, %s, %s)
                    """,
                    (
                        UUID(document_id),
                        chunk["chunk_id"],
                        chunk["page"],
                        chunk["text"],
                        np.asarray(embedding, dtype=np.float32),
                    ),
                )

        connection.commit()

    return {
        "document_id": document_id,
        "saved_chunks": len(chunks),
        "status": "indexed",
    }


def search_similar_chunks(
    document_id: str,
    query_embedding: np.ndarray,
    top_k: int = 3,
) -> list[dict]:
    """Search stored embeddings using pgvector."""

    if not 1 <= top_k <= 10:
        raise ValueError("top_k must be between 1 and 10")

    query_vector = np.asarray(query_embedding, dtype=np.float32)

    if query_vector.shape != (384,):
        raise ValueError("Expected a 384-dimensional embedding")

    with get_connection() as connection:
        register_vector(connection)

        with connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT
                    chunk_index,
                    page_number,
                    content,
                    1 - (embedding <=> %s) AS similarity
                FROM document_chunks
                WHERE document_id = %s
                ORDER BY embedding <=> %s
                LIMIT %s
                """,
                (
                    query_vector,
                    UUID(document_id),
                    query_vector,
                    top_k,
                ),
            )

            rows = cursor.fetchall()

    return [
        {
            "chunk_id": row[0],
            "page": row[1],
            "text": row[2],
            "score": round(float(row[3]), 4),
        }
        for row in rows
    ]
