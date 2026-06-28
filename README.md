# 🧠 Nexus AI — Intelligent Hiring & Talent Intelligence Platform

A production-grade hiring platform with a **dual-backend microservice architecture**. Django handles secure business logic, user management, and relational filtering. A separate asynchronous **FastAPI AI microservice** processes resume parsing, RAG-based Q&A, and semantic vector search — enabling recruiters to discover candidates through natural language queries and chat with resumes using AI.

---

## 🏗️ Architecture

```
                    ┌──────────────────────┐
                    │   React + Vite       │
                    │   (Frontend :5173)   │
                    └─────────┬────────────┘
                              │ JWT Auth
                              ▼
                    ┌──────────────────────┐
                    │   Django + DRF       │
                    │   (Backend :8000)    │
                    │   Auth, CRUD, ORM    │
                    └────┬────────────┬────┘
                         │            │
          Internal Token │            │ Internal Token
                         ▼            ▼
                    ┌──────────────────────┐
                    │   FastAPI            │
                    │   (AI Service :8001) │
                    │   Parse, Embed, RAG  │
                    └───┬──────┬──────┬────┘
                        │      │      │
                        ▼      ▼      ▼
                  ┌───────┐ ┌───────┐ ┌──────────┐
                  │Postgre│ │FAISS  │ │NVIDIA API│
                  │ SQL   │ │Index  │ │ (LLMs)   │
                  └───────┘ └───────┘ └──────────┘
```

### Why This Architecture?

| Decision | Justification |
|---|---|
| **Django as primary backend** | Business logic (auth, CRUD, permissions, admin) is 70% of the app. Django provides all of this out-of-the-box. |
| **FastAPI as AI microservice** | AI tasks are I/O-bound (LLM API calls, PDF reading, vector search). FastAPI's async-first design handles concurrent I/O without blocking. |
| **Separate services** | Business logic and AI logic evolve at different rates. Separation lets you scale AI independently and swap LLM providers without touching business code. |
| **FAISS over cloud vector DB** | For resume-scale data (~thousands of documents), FAISS is fast, free, and runs locally with no vendor lock-in. |
| **RAG over fine-tuning** | Recruitment data is private and dynamic. RAG lets the system use new resumes immediately without retraining. |

---

## ✨ Key Features

### For Candidates
- **Profile Management** — Edit phone, location, years of experience
- **Resume Upload** — Drag-and-drop PDF upload with real-time processing status
- **AI Skill Extraction** — Llama 3.1 70B automatically extracts and normalizes skills from resumes
- **Processing Status Tracking** — Live status updates: Pending → Processing → Ready / Failed

### For Recruiters
- **Hybrid Semantic Search** — Natural language queries ("Python developer with cloud experience") combined with SQL filters (min experience, location, skills)
- **Resume Chat (RAG)** — ChatGPT-style interface to ask questions about any candidate's resume with source citations
- **Match Scoring** — FAISS similarity scores displayed as percentage match for each candidate

### Platform
- **JWT Authentication** — Stateless auth with access/refresh tokens
- **Role-Based Access** — Candidates and Recruiters see different dashboards
- **Docker Compose** — One-command multi-service orchestration
- **Async AI Pipeline** — Non-blocking resume processing with callback status updates

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | React 18, Vite 5, Tailwind CSS 3 | Responsive UI with dark theme |
| **Business Backend** | Django 6, Django REST Framework | Auth, CRUD, ORM, Admin, Permissions |
| **AI Service** | FastAPI, Uvicorn | Resume parsing, RAG, semantic search |
| **Database** | PostgreSQL | Structured relational data (ACID) |
| **Vector Store** | FAISS (IndexFlatIP) | Semantic similarity search |
| **LLM (Heavy)** | `meta/llama-3.1-70b-instruct` | Skill extraction, complex reasoning |
| **LLM (Fast)** | `meta/llama-3.1-8b-instruct` | RAG chat, lightweight synthesis |
| **Embeddings** | `nvidia/nv-embedqa-e5-v5` | 1024-dim document & query embeddings |
| **PDF Extraction** | PyMuPDF (fitz) | Layout-aware text extraction |
| **Chunking** | LangChain Text Splitters | Overlapping chunks for RAG |
| **Deployment** | Docker, Docker Compose | Multi-service orchestration |

---

## 📁 Project Structure

```
Project/
├── docker-compose.yml          # Multi-service orchestration
├── .env                        # Environment variables (not in git)
├── .env.example                # Template for environment setup
├── README.md
│
├── backend/                    # Django project
│   ├── config/                 # Settings (base/development/production)
│   │   ├── settings/
│   │   └── urls.py             # Root URL config
│   ├── apps/
│   │   ├── accounts/           # Custom User, JWT auth, registration
│   │   ├── core/               # Shared models: Company, Skill
│   │   ├── candidates/         # Profile, Resume upload, AI callbacks
│   │   ├── recruiters/         # Recruiter profiles
│   │   ├── jobs/               # Job postings, Applications
│   │   └── search/             # Hybrid search proxy, RAG chat proxy
│   └── requirements.txt
│
├── ai_service/                 # FastAPI microservice
│   ├── app/
│   │   ├── main.py             # FastAPI app entry point
│   │   ├── config.py           # Pydantic settings (env vars)
│   │   ├── routers/
│   │   │   ├── health.py       # Liveness + readiness probes
│   │   │   ├── parsing.py      # POST /process-resume/
│   │   │   ├── search.py       # POST /search/
│   │   │   └── chat.py         # POST /ask-resume/
│   │   ├── schemas/            # Pydantic request/response models
│   │   └── services/
│   │       ├── pdf_extractor.py    # PyMuPDF text extraction
│   │       ├── skill_extractor.py  # LLM-based skill extraction
│   │       ├── chunker.py          # LangChain text splitting
│   │       ├── embeddings.py       # NVIDIA embedding generation
│   │       ├── vector_store.py     # FAISS index management
│   │       └── rag_pipeline.py     # RAG answer generation
│   └── requirements.txt
│
└── frontend/                   # React + Vite
    ├── src/
    │   ├── api/client.js       # Axios instance with JWT interceptor
    │   ├── context/AuthContext.jsx  # Global auth state
    │   └── pages/
    │       ├── Landing.jsx
    │       ├── Login.jsx
    │       ├── Register.jsx
    │       ├── CandidateDashboard.jsx
    │       └── RecruiterDashboard.jsx
    └── package.json
```

---

## 🚀 Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- PostgreSQL 14+
- NVIDIA API keys (free tier): [build.nvidia.com](https://build.nvidia.com)

### 1. Clone & Configure

```bash
git clone https://github.com/TANAY-BARGIR/ai-hiring-platform.git
cd ai-hiring-platform
cp .env.example .env
# Edit .env with your PostgreSQL credentials and NVIDIA API keys
```

### 2. Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver 0.0.0.0:8000
```

### 3. AI Service Setup

```bash
cd ai_service
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload
```

### 4. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### 5. Open in Browser

- **Frontend**: http://localhost:5173
- **Django Admin**: http://localhost:8000/admin
- **FastAPI Docs**: http://localhost:8001/docs

### Docker (Alternative)

```bash
docker compose up --build
```

---

## 🔌 API Endpoints

### Django (Frontend-Facing, JWT Auth)

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register/` | Register new user (Candidate/Recruiter) |
| `POST` | `/api/auth/login/` | Login → JWT tokens + role |
| `POST` | `/api/auth/token/refresh/` | Refresh access token |
| `GET/PATCH` | `/api/candidates/profile/` | View/update candidate profile |
| `GET` | `/api/candidates/resumes/` | List uploaded resumes |
| `POST` | `/api/candidates/resumes/upload/` | Upload PDF resume |
| `POST` | `/api/search/` | Hybrid semantic search + SQL filters |
| `POST` | `/api/search/ask-resume/` | RAG-based resume Q&A |

### FastAPI (Internal, Token Auth)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Liveness probe |
| `GET` | `/health/db` | Readiness probe (DB connection) |
| `POST` | `/process-resume/` | Full AI pipeline (extract → embed → index) |
| `POST` | `/search/` | FAISS semantic search |
| `POST` | `/ask-resume/` | RAG answer generation |

---

## 🔄 Core Data Flows

### Resume Processing Pipeline
```
Upload PDF → Django saves to shared volume
           → Django POSTs to FastAPI /process-resume/
           → FastAPI: Extract text (PyMuPDF)
           → FastAPI: Extract skills (Llama 70B)
           → FastAPI: Chunk text (LangChain)
           → FastAPI: Generate embeddings (nv-embedqa-e5-v5)
           → FastAPI: Index in FAISS
           → FastAPI: Callback to Django with skills + status
           → Django: Update CandidateProfile skills + Resume status
```

### Hybrid Search Flow
```
Recruiter types: "Python developer with cloud experience"
+ Filters: min_experience=3, location="Bangalore"

Frontend → Django POST /api/search/
         → Django → FastAPI POST /search/ (FAISS)
         → FAISS returns candidate_ids + similarity scores
         → Django ORM: filter(id__in=ids, years_of_experience__gte=3, location="Bangalore")
         → Return ranked candidates with match percentages
```

### RAG Resume Chat Flow
```
Recruiter asks: "Does this person have microservices experience?"

Frontend → Django POST /api/search/ask-resume/
         → Django → FastAPI POST /ask-resume/
         → FastAPI: Embed question (nv-embedqa-e5-v5)
         → FastAPI: Retrieve top-5 resume chunks from FAISS
         → FastAPI: Feed chunks + question to Llama 8B
         → Return grounded answer + source excerpts
```

---

## 🔐 Environment Variables

```bash
# Database
DB_NAME=hiring_platform
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432

# Django
DJANGO_SECRET_KEY=your_secret_key
DJANGO_DEBUG=True

# NVIDIA API Keys (one per model for independent free-tier quotas)
NVIDIA_LLM_API_KEY=nvapi-...     # Llama 3.1 70B (skill extraction)
NVIDIA_EMBED_API_KEY=nvapi-...   # nv-embedqa-e5-v5 (embeddings)
NVIDIA_CHAT_API_KEY=nvapi-...    # Llama 3.1 8B (RAG chat)

# Internal Service Auth
INTERNAL_API_TOKEN=your_internal_token
AI_SERVICE_URL=http://localhost:8001
```

---

## 🧪 Development Notes

- **FAISS Index**: Starts empty. Populated automatically when the first resume is uploaded and processed.
- **3-Model Strategy**: Each NVIDIA model uses a separate API key to maximize free-tier usage (separate rate limits).
- **Async Processing**: Resume processing is non-blocking. Django returns 202 immediately; FastAPI processes in the background and calls back when done.
- **CORS**: Configured for `localhost` in development mode. Restrict in production.

---

## 📄 License

MIT
