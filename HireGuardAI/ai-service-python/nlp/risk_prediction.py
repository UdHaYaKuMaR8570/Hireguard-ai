"""
Risk Prediction module mapping numeric scam probabilities into enterprise classification tiers.
Thresholds are explicitly defined as named constants configurable via environment variables.
"""
import os
from dotenv import load_dotenv

load_dotenv()

# Named Constants loaded from environment variables (No magic numbers)
LOW_RISK_THRESHOLD: int = int(os.getenv("LOW_RISK_THRESHOLD", "30"))
HIGH_RISK_THRESHOLD: int = int(os.getenv("HIGH_RISK_THRESHOLD", "70"))


def classify_risk_level(scam_probability: int) -> str:
    """
    Maps a 0-100 numeric scam probability score to an actionable risk level tier.

    Args:
        scam_probability (int): Numeric probability from 0 to 100.

    Returns:
        str: 'LOW', 'MEDIUM', or 'HIGH'.
    """
    # Ensure probability is bounded between 0 and 100
    bounded_prob = max(0, min(100, int(scam_probability)))

    if bounded_prob < LOW_RISK_THRESHOLD:
        return "LOW"
    elif bounded_prob <= HIGH_RISK_THRESHOLD:
        return "MEDIUM"
    else:
        return "HIGH"
