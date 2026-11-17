
from backend.embeddings import embed_query
from backend.repository import search_similar_chunks


document_id = "5756cef4-461f-4b00-81e4-68ccdc1c86d3"

query = "Як розрахувати дисперсію випадкової величини?"

query_vector = embed_query(query)

results = search_similar_chunks(
    document_id=document_id,
    query_embedding=query_vector,
    top_k=3,
)

print("Query:", ascii(query))
print("Results:", len(results))

for result in results:
    print("\n----------------------------")
    print("Page:", result["page"])
    print("Chunk:", result["chunk_id"])
    print("Similarity:", result["score"])
    print("Preview:", result["text"][:200])
