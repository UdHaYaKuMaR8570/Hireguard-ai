# Software Requirements Specification (SRS) - HireGuard AI

## 1. System Overview
HireGuard AI is an automated, graph-aware employer trust verification and job scam prevention system. It protects job seekers by analyzing employer web infrastructure, recruiter contact credentials, government registration records, blacklist databases, historical scam complaints, and NLP job posting text.

## 2. Multi-Verification Requirements

### 2.1 WHOIS Domain Verification
- Shall query domain registrar data to determine domain age in months.
- Domains registered < 6 months ago shall be flagged as HIGH RISK.

### 2.2 Advanced Email Validation
- Shall validate recruiter email syntax using standard RFC regex formatting.
- Shall compare recruiter email domain against the company's verified website domain.
- Shall flag generic email providers (`gmail.com`, `yahoo.com`, `outlook.com`) as medium-risk signals when used for corporate roles.
- Shall detect typosquatting domain variants using Levenshtein distance and domain substring comparison.

### 2.3 Government / MCA Company Registration
- Shall define a `CompanyRegistrationProvider` interface to support external government APIs (such as MCA).
- If API credentials are not configured, the system shall return `status = "VERIFICATION_UNAVAILABLE"` and `riskScore = 0` without penalizing the company.

### 2.4 Blacklist & Reputation Verification
- Shall maintain a MongoDB collection `blacklist_entries` for domain, email, company name, and phone blacklists.
- Shall cross-reference all employer verification requests against active blacklist entries.

### 2.5 Trust Score & Risk Level Mapping
- Trust score shall be calculated using configurable signal weights (`TrustScoreConfig`):
  - WHOIS: 15%
  - Email Validation: 15%
  - Company Registration: 20%
  - Blacklist: 20%
  - Complaint History: 15%
  - AI NLP Analysis: 15%
- Risk Levels:
  - Score >= 80: LOW RISK
  - 50 <= Score < 80: MODERATE RISK
  - Score < 50: HIGH RISK
