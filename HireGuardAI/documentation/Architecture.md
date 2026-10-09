# HireGuard AI - Architecture Design & Multi-Verification Pipeline

## Polyglot Persistence Architecture

HireGuard uses a polyglot persistence strategy, combining MongoDB Atlas and Neo4j:
- **MongoDB Atlas**: Primary system of record for unstructured documents, complaints, audit logs (`verification_audit_logs`), blacklist entries (`blacklist_entries`), and trust reports (`trust_reports`).
- **Neo4j**: Graph intelligence engine for multi-hop relationship traversals, shared domain clustering, recruiter over-exposure detection, and fraud ring identification.

---

## Multi-Verification Pipeline Architecture

```
Job Posting (LinkedIn / Indeed)
      ↓
Company / Recruiter Extraction (Chrome Extension)
      ↓
Spring Boot Backend (REST API /api/verification/employer)
      ↓
┌─────────────────────────────────────────────────────────────┐
│ Multi-Signal Employer Verification Layer                   │
│                                                             │
│ 1. WHOIS Verification        (Domain Age & Registrar)       │
│ 2. Advanced Email Validation (Syntax, Domain, Typosquatting)│
│ 3. Company Registration      (MCA / Govt API Provider)      │
│ 4. Blacklist Verification    (Internal & Global Feeds)      │
└─────────────────────────────────────────────────────────────┘
      ↓
Neo4j Graph Intelligence + Python AI Transformer Service
      ↓
Trust Score Engine (Weighted Signal Score & Explainability)
      ↓
Risk Level Assignment (LOW / MEDIUM / HIGH)
      ↓
React Dashboard & Chrome Extension UI
```

---

## Service Implementation Status

| Verification Service | Status | Provider Mechanism | Fallback Behavior |
|----------------------|--------|-------------------|-------------------|
| **WHOIS Lookup** | ✅ IMPLEMENTED | External API via `WhoisService` | Bypasses check safely if URL/Key missing |
| **Advanced Email Validation** | ✅ IMPLEMENTED | `EmailValidationService` (Syntax, Domain Match, Typosquatting, Neo4j) | Evaluates internal signals without external dependency |
| **Company Registration (MCA)** | ⚙️ PROVIDER ARCHITECTURE READY | `CompanyRegistrationProvider` / `McaCompanyRegistrationProvider` | Returns `VERIFICATION_UNAVAILABLE` when API credentials missing |
| **Blacklist Database** | ✅ IMPLEMENTED | `BlacklistRepository` & `InternalBlacklistProvider` | Checks MongoDB `blacklist_entries` collection |

---

## API Endpoints

- `POST /api/verification/email` — Standalone email domain & syntax audit
- `POST /api/verification/company-registration` — Government registration check
- `POST /api/verification/blacklist` — Blacklist entry lookup
- `POST /api/verification/employer` — Unified multi-verification pipeline
