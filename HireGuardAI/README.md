# HireGuard AI

Graph-Based Employer Trust Verification and Scam Prevention System.

## Project Phases
- [x] **Phase 1**: Database Architecture Design
- [x] **Phase 2**: Spring Boot Backend Development
- [x] **Phase 3**: React Frontend Development
- [x] **Phase 4**: AI/NLP Service Integration (FastAPI/Python)
- [x] **Phase 5**: Neo4j Trust Graph Integration
- [x] **Phase 6**: Chrome Extension Development
- [ ] **Phase 7**: Testing and Deployment

## Architecture Overview

| Service | Technology | Port | Status |
|---------|-----------|------|--------|
| Backend REST API | Spring Boot 3.2 + Java 17 | `8080` | ✅ Complete |
| AI/NLP Microservice | Python FastAPI + DistilBERT | `8001` | ✅ Complete |
| Frontend Web App | React 19 + Vite + TailwindCSS | `5173` | ✅ Complete |
| Graph Database | Neo4j (Bolt) | `7687` | ✅ Complete |
| Document Database | MongoDB | `27017` | ✅ Complete |
| Chrome Extension | Manifest V3 | N/A | ✅ Complete |

## API Endpoints

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Register new user account
- `POST /api/auth/login` — Authenticate and receive JWT
- `GET /api/auth/me` — Get current user profile

### Company Verification (`/api/company`)
- `POST /api/company/verify` — Onboard and verify an employer domain
- `GET /api/company/{id}` — Fetch employer profile
- `GET /api/company/search?name=` — Search employer index
- `GET /api/company/{id}/trust-score` — Get graph-aware trust score
- `GET /api/company/{id}/complaints` — Get complaints filed against employer

### Scam Complaints (`/api/complaints`)
- `POST /api/complaints` — Submit scam evidence report (JWT required)
- `GET /api/complaints/{id}` — Get specific complaint

### Admin (`/api/admin`) — ADMIN role required
- `GET /api/admin/stats` — Platform-wide aggregate statistics
- `GET /api/admin/companies` — All registered company documents
- `GET /api/admin/complaints` — All complaint reports

### Graph Topology (`/api/graph`) — Phase 5
- `GET /api/graph/{id}/topology` — Neo4j node/edge topology for React Flow visualization

### AI Service (`http://localhost:8001`)
- `GET /health` — Service status
- `POST /predict` — Scam probability classification

## Trust Score Formula

```
TrustScore = 100.0 - MongoStatusPenalty - AiPenalty - GraphPenalty

MongoStatusPenalty: VERIFIED=0, PENDING=15, UNVERIFIED=25, REJECTED/SUSPICIOUS=40
AiPenalty:          scamProbability * 0.40 (from Python NLP service)
GraphPenalty:       Domain clustering=20, Recruiter overlap=15,
                    Scam archetype=25, Fraud ring=35 (max 60 pts)

Risk Tier: >= 80 = LOW_RISK, 50-79 = MODERATE_RISK, < 50 = HIGH_RISK
```

## Setup Instructions

### Prerequisites
- Docker Desktop
- Java 17+ (for local Spring Boot development)
- Node.js 20+ (for local React development)
- Python 3.10+ (for local AI service development)

### Quick Start (Docker Compose)
```bash
cd HireGuardAI
docker-compose up --build
```

This starts all 5 services: MongoDB, Neo4j, AI Service, Spring Boot Backend, React Frontend.

### Local Development

**Backend:**
```bash
cd backend-springboot
./mvnw spring-boot:run
```

**Frontend:**
```bash
cd frontend-react
npm install
npm run dev
```

**AI Service:**
```bash
cd ai-service-python
pip install -r requirements.txt
uvicorn app:app --reload --port 8001
```

### Chrome Extension (Phase 6)
1. Open Chrome → `chrome://extensions/`
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Select the `chrome-extension/` directory

The extension will scan LinkedIn and Indeed job postings automatically and display trust scores in the popup.
