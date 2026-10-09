# HireGuard AI

Graph-Based Employer Trust Verification and Scam Prevention System.

## Architecture Overview

| Service | Technology | Port | Status |
|---------|-----------|------|--------|
| Backend REST API | Spring Boot 3.2 + Java 17 | `8080` | ✅ Complete |
| AI/NLP Microservice | Python FastAPI + DistilBERT | `8001` | ✅ Complete |
| Frontend Web App | React 19 + Vite + TailwindCSS | `5173` | ✅ Complete |
| Graph Database | Neo4j (Bolt) | `7687` | ✅ Complete |
| Document Database | MongoDB Atlas | `27017` | ✅ Complete |
| Chrome Extension | Manifest V3 | N/A | ✅ Complete |

---

## Verification Pipeline Services

1. **WHOIS Lookup**: Evaluates domain age & registrar stability. (`WhoisService.java`)
2. **Advanced Email Validation**: Evaluates syntax, domain matching, free email providers, and typosquatting domain variants (`EmailValidationService.java`).
3. **Company Registration (MCA)**: Pluggable provider architecture (`CompanyRegistrationProvider`). Returns `VERIFICATION_UNAVAILABLE` if credentials missing without penalizing company score.
4. **Blacklist Database Verification**: Checks domain, company, email against MongoDB `blacklist_entries` (`BlacklistVerificationService.java`).

---

## API Endpoints

### Verification APIs (`/api/verification`)
- `POST /api/verification/email` — Standalone email validation audit
- `POST /api/verification/company-registration` — Government registration check
- `POST /api/verification/blacklist` — Blacklist entry lookup
- `POST /api/verification/employer` — Unified multi-verification pipeline

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Register new user account
- `POST /api/auth/login` — Authenticate and receive JWT
- `GET /api/auth/me` — Get current user profile

### Company Verification (`/api/company`)
- `POST /api/company/verify` — Onboard and verify an employer domain
- `GET /api/company/{id}` — Fetch employer profile
- `GET /api/company/search?name=` — Search employer index
- `GET /api/company/{id}/trust-score` — Get graph-aware trust score

### Admin Blacklist (`/api/admin/blacklist`) — ADMIN role required
- `GET /api/admin/blacklist` — List all active blacklist entries
- `POST /api/admin/blacklist` — Add new domain/email/company blacklist entry
- `DELETE /api/admin/blacklist/{id}` — Delete blacklist entry

---

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `WHOIS_API_URL` | External WHOIS API endpoint template | Blank |
| `WHOIS_API_KEY` | External WHOIS API key | Blank |
| `MCA_API_URL` | External MCA government registration API | Blank |
| `MCA_API_KEY` | External MCA API key | Blank |
| `MONGODB_URI` | MongoDB connection URI | `mongodb://localhost:27017/hireguard` |
| `NEO4J_URI` | Neo4j Bolt connection URI | `bolt://localhost:7687` |

---

## Setup Instructions

### Backend
```bash
cd backend-springboot
./mvnw spring-boot:run
```

### Run Tests
```bash
cd backend-springboot
./mvnw test
```

### Frontend
```bash
cd frontend-react
npm run dev
```
