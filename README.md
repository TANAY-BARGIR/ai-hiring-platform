# AI-Powered Hiring & Talent Intelligence Platform

A hybrid AI hiring platform utilizing a dual-backend microservice architecture. Django handles secure business logic, user management, and relational filtering. A separate, asynchronous FastAPI microservice processes AI tasks — resume parsing, RAG-based Q&A, and vector search — enabling recruiters to combine traditional SQL filtering with semantic search.

## Architecture

```
Frontend (React + Vite)
        │
        ▼
  Django (DRF) ── Business Backend
        │
        ▼
  FastAPI ── AI Microservice
    │         │
    ▼         ▼
  FAISS    NVIDIA LLM API
    │
    ▼
 PostgreSQL
```

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React, Vite | User interface |
| **Business Backend** | Django, Django REST Framework | Auth, CRUD, ORM, Admin |
| **AI Service** | FastAPI | Resume parsing, RAG, semantic search |
| **Database** | PostgreSQL | Structured relational data |
| **Vector Store** | FAISS | Semantic similarity search |
| **LLM** | NVIDIA API (Llama 3.1) | Text generation, skill extraction |
| **Embeddings** | nv-embedqa-e5-v5 | Document & query embeddings |
| **Deployment** | Docker, Docker Compose | Multi-service orchestration |

## Project Structure

```
├── backend/          # Django project
├── ai_service/       # FastAPI AI microservice
├── frontend/         # React + Vite
└── docker-compose.yml
```

## Setup

> Setup instructions will be added as the project develops.

## License

MIT
