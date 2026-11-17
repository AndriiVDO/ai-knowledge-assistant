from fastapi import FastAPI
from backend.documents import router as documents_router

app = FastAPI(
    title="AI Knowledge Assistant API",
    description="Backend API for an AI-powered document assistant",
    version="0.1.0"
)

app.include_router(documents_router)

@app.get("/")
def root():
    return {
        "message": "Welcome to AI Knowledge Assistant"
    }


@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": "ai-knowledge-assistant"
    }
