
def chunk_pages(
    pages: list[dict],
    chunk_size: int = 800,
    overlap: int = 150
) -> list[dict]:
    """Split PDF pages into overlapping text chunks."""

    if chunk_size <= 0:
        raise ValueError("chunk_size must be positive")

    if not 0 <= overlap < chunk_size:
        raise ValueError("overlap must be smaller than chunk_size")

    chunks = []
    step = chunk_size - overlap

    for page in pages:
        text = page["text"]
        page_number = page["page"]

        for start in range(0, len(text), step):
            end = min(start + chunk_size, len(text))
            content = text[start:end].strip()

            if not content:
                continue

            chunks.append({
                "chunk_id": len(chunks) + 1,
                "page": page_number,
                "text": content,
                "start_char": start,
                "end_char": end
            })

            if end == len(text):
                break

    return chunks
