
from backend.rag import retrieve_context
from backend.llm import generate_answer


document_id = "5756cef4-461f-4b00-81e4-68ccdc1c86d3"

question = "Як розрахувати дисперсію випадкової величини?"

# Step 1: Retrieve relevant PDF chunks
rag_data = retrieve_context(
    document_id=document_id,
    question=question,
    top_k=2,
)

print("Sources:", rag_data["sources"])
print("Context length:", len(rag_data["context"]))

# Step 2: Generate an AI answer
print("\nGenerating AI answer...")

answer = generate_answer(
    question=question,
    context=rag_data["context"],
)

print("\n=== AI ANSWER ===")
print(answer)

print("\n=== RETRIEVED SOURCES ===")
for source in rag_data["sources"]:
    print(
        f"Page {source['page']} | "
        f"Chunk {source['chunk_id']} | "
        f"Similarity {source['score']}"
    )
