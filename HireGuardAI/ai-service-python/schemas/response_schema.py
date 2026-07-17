"""
Pydantic Response Schema for POST /predict endpoint.
"""
from typing import List, Dict
from pydantic import BaseModel, Field


class ScamSignals(BaseModel):
    """
    Structured entity extraction flags identifying specific scam characteristics.
    """
    hasUpfrontFeeDemand: bool = Field(..., description="Flag if mandatory upfront fees or check cashing schemes are demanded.")
    hasUrgencyPhrases: bool = Field(..., description="Flag if high-pressure immediate hiring or zero-interview phrases exist.")
    hasUnrealisticSalary: bool = Field(..., description="Flag if salary/easy money promises are disproportionate to entry-level duties.")
    hasSuspiciousContact: bool = Field(..., description="Flag if unofficial contact methods (Telegram, WhatsApp, free webmail) are used.")


class PredictResponse(BaseModel):
    """
    Output schema for job post scam risk evaluation and explainability audit trail.
    """
    scamProbability: int = Field(..., ge=0, le=100, description="Calculated scam probability score from 0 to 100.")
    riskLevel: str = Field(..., description="Classification risk tier: 'LOW', 'MEDIUM', or 'HIGH'.")
    reasons: List[str] = Field(..., description="Human-readable audit trail explaining what triggered or lowered the risk classification.")
    signals: ScamSignals = Field(..., description="Structured boolean entity flags extracted from the job description.")

    class Config:
        json_schema_extra = {
            "example": {
                "scamProbability": 88,
                "riskLevel": "HIGH",
                "reasons": [
                    "Flagged mandatory upfront payment/equipment deposit or check refund scheme (High Fraud Signal).",
                    "Flagged high-pressure urgency tactics ('act now', 'no interview needed', 'limited slots').",
                    "Flagged unofficial communication channel (Telegram/WhatsApp or unverified free webmail contact)."
                ],
                "signals": {
                    "hasUpfrontFeeDemand": True,
                    "hasUrgencyPhrases": True,
                    "hasUnrealisticSalary": False,
                    "hasSuspiciousContact": True
                }
            }
        }
