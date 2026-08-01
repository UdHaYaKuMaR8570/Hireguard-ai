"""
HireGuard AI — Standalone Python FastAPI Microservice for Explainable Job Scam Detection.

Per Phase 4 rules:
- This service operates independently of the Spring Boot backend (`TrustScoreService.java`).
- Integration into `TrustScoreController.java` is reserved until post-Phase 4 approval.
- Run standalone via: `uvicorn app:app --reload --port 8001`
"""
import os
from fastapi import FastAPI, status, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from schemas.request_schema import PredictRequest
from schemas.response_schema import PredictResponse, ScamSignals
from nlp.scam_detection import analyze_job_scam_probability
from preprocessing.tokenizer import get_tokenizer

load_dotenv()

# Initialize FastAPI application
app = FastAPI(
    title="HireGuard AI — Scam Detection & NLP Microservice",
    description="Standalone explainable AI classification pipeline for identifying counterfeit employment scams.",
    version="1.0.0 (Phase 4 Standalone)"
)

# Enable CORS for local testing and future backend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Standalone testing mode allows all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_event():
    """
    Log startup configuration and initialize Hugging Face tokenizer singleton if offline/cache available.
    """
    model_name = os.getenv("MODEL_NAME", "distilbert-base-uncased")
    port = os.getenv("PORT", "8001")
    print(f"[BOOTSTRAP] HireGuard AI NLP Service starting on port {port}. Base Transformer: {model_name}")
    try:
        _ = get_tokenizer(model_name)
        print("[BOOTSTRAP] Tokenizer initialized successfully.")
    except Exception as e:
        print(f"[BOOTSTRAP NOTICE] Tokenizer lazy initialization notice: {e}. Pipeline will fallback to cleaned text rules.")


@app.get("/health", status_code=status.HTTP_200_OK, tags=["System Health"])
async def health_check():
    """
    Simple health check endpoint verifying microservice status and active configuration.
    """
    return {
        "status": "UP",
        "service": "HireGuard AI — Scam Detection Microservice",
        "phase": "PHASE 4 STANDALONE",
        "config": {
            "modelName": os.getenv("MODEL_NAME", "distilbert-base-uncased"),
            "lowRiskThreshold": int(os.getenv("LOW_RISK_THRESHOLD", "30")),
            "highRiskThreshold": int(os.getenv("HIGH_RISK_THRESHOLD", "70"))
        }
    }


@app.post("/predict", response_model=PredictResponse, status_code=status.HTTP_200_OK, tags=["Scam Prediction"])
async def predict_scam(payload: PredictRequest):
    """
    Evaluates job description text and recruiter contact metadata for employment fraud indicators.
    Returns numeric scam probability (0-100), risk tier (`LOW`/`MEDIUM`/`HIGH`), structured entity signals, and explainability audit trail.
    """
    try:
        scam_prob, risk_level, reasons, signals_dict = analyze_job_scam_probability(
            job_description=payload.jobDescription,
            company_name=payload.companyName or "",
            recruiter_email=payload.recruiterEmail or ""
        )

        signals_model = ScamSignals(
            hasUpfrontFeeDemand=signals_dict.get("hasUpfrontFeeDemand", False),
            hasUrgencyPhrases=signals_dict.get("hasUrgencyPhrases", False),
            hasUnrealisticSalary=signals_dict.get("hasUnrealisticSalary", False),
            hasSuspiciousContact=signals_dict.get("hasSuspiciousContact", False),
        )

        return PredictResponse(
            scamProbability=scam_prob,
            riskLevel=risk_level,
            reasons=reasons,
            signals=signals_model
        )
    except Exception as e:
        print(f"[ERROR] Scam prediction execution failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while evaluating job scam probability: {str(e)}"
        )
if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", "8001"))
    host = os.getenv("HOST", "0.0.0.0")
    uvicorn.run("app:app", host=host, port=port, reload=True)
