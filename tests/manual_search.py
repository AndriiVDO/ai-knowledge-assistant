
from pathlib import Path

from backend.pdf_processor import extract_pdf_text
from backend.chunking import chunk_pages
from backend.search import semantic_search


path = Path(
    "uploads/5756cef4-461f-4b00-81e4-68ccdc1c86d3.pdf"
)

document = extract_pdf_text(path)
chunks = chunk_pages(document["pages"])

query = "Як розрахувати дисперсію випадкової величини?"

results = semantic_search(query, chunks, top_k=3)

print("Query:", ascii(query))

for result in results:
    print("\n----------------------------")
    print("Page:", result["page"])
    print("Chunk:", result["chunk_id"])
    print("Similarity:", result["score"])
    print("Preview:", result["text"][:250])
