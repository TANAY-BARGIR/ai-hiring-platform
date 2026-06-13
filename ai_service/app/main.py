"""
AI Hiring Platform — FastAPI AI Microservice

Entry point for the AI service. Handles:
- Resume parsing and skill extraction
- Semantic search via FAISS (Phase 3)
- RAG-based resume chat (Phase 3)

This service runs alongside Django and communicates via internal HTTP.
"""

import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import health, parsing, search

# ---- Logging setup ----
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)

# ---- Create FastAPI app ----
app = FastAPI(
    title="AI Hiring Platform — AI Service",
    description=(
        "Async AI microservice for resume parsing, semantic search, "
        "and RAG-based Q&A. Communicates with the Django backend via "
        "internal HTTP callbacks."
    ),
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ---- CORS (for development — FastAPI docs) ----
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---- Register routers ----
app.include_router(health.router)
app.include_router(parsing.router)
app.include_router(search.router)


@app.get("/")
async def root():
    return {
        "service": "AI Hiring Platform — AI Service",
        "version": "0.1.0",
        "docs": "/docs",
    }
