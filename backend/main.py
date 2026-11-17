
from fastapi import FastAPI

app = FastAPI(
    title="AI Knowledge Assistant API",
    description="Backend API for an AI-powered document assistant",
    version="0.1.0"
)


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
