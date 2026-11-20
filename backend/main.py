
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.documents import router as documents_router


app = FastAPI(
    title="AI Knowledge Assistant API",
    description="Backend API for an AI-powered document assistant",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)

app.include_router(documents_router)


@app.get("/")
def root():
    return {"message": "Welcome to AI Knowledge Assistant"}


@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": "ai-knowledge-assistant",
    }
