
from backend.rag import retrieve_context


document_id = "5756cef4-461f-4b00-81e4-68ccdc1c86d3"

question = "Як розрахувати дисперсію випадкової величини?"

result = retrieve_context(
    document_id=document_id,
    question=question,
    top_k=3,
)

print("Question:", ascii(result["question"]))
print("Sources:", result["sources"])
print("\nContext preview:")
print(result["context"][:1000])
