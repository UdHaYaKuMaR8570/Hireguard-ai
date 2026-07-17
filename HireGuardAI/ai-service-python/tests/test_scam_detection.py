"""
Unit Tests for Standalone Scam Detection Service (`tests/test_scam_detection.py`).

Covers:
1. System health verification (`GET /health`).
2. Clearly fraudulent job post (`POST /predict`).
3. Clearly legitimate job post (`POST /predict`).
4. Ambiguous edge case (`POST /predict`).
"""
import pytest
from fastapi.testclient import TestClient
from app import app

client = TestClient(app)


def test_health_check():
    """
    Verifies that the microservice health endpoint returns 200 OK and valid configuration parameters.
    """
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "UP"
    assert data["phase"] == "PHASE 4 STANDALONE"
    assert "config" in data
    assert data["config"]["lowRiskThreshold"] == 30
    assert data["config"]["highRiskThreshold"] == 70


def test_predict_clearly_fraudulent():
    """
    Test Case 1: Clearly Fraudulent Job Post.
    Must trigger upfront payment demand, high urgency, and free webmail flags resulting in HIGH risk tier (>70).
    """
    payload = {
        "jobDescription": "Immediate hiring! Act now for our data entry clerk work from home position. Earn $85/hour with no experience required. You must wire $150 upfront processing fee to receive your company laptop and starter kit from our vendor.",
        "companyName": "Global Apex Career Solutions",
        "recruiterEmail": "hiring-desk-urgent@gmail.com"
    }
    response = client.post("/predict", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["scamProbability"] >= 70
    assert data["riskLevel"] == "HIGH"
    assert data["signals"]["hasUpfrontFeeDemand"] is True
    assert data["signals"]["hasUrgencyPhrases"] is True
    assert data["signals"]["hasSuspiciousContact"] is True
    assert len(data["reasons"]) > 0


def test_predict_clearly_legitimate():
    """
    Test Case 2: Clearly Legitimate Job Post.
    Standard corporate job posting from a verified domain with zero high-risk regex or semantic flags (<30 LOW risk).
    """
    payload = {
        "jobDescription": "Senior Java Backend Engineer at Google. We are looking for an experienced developer with expertise in Spring Boot, MongoDB, and distributed systems. Competitive base salary, comprehensive health benefits, and standard 4-round technical interview process involving coding and system design.",
        "companyName": "Google LLC",
        "recruiterEmail": "recruiting-team@google.com"
    }
    response = client.post("/predict", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["scamProbability"] < 30
    assert data["riskLevel"] == "LOW"
    assert data["signals"]["hasUpfrontFeeDemand"] is False
    assert data["signals"]["hasUrgencyPhrases"] is False
    assert data["signals"]["hasUnrealisticSalary"] is False
    assert data["signals"]["hasSuspiciousContact"] is False


def test_predict_ambiguous_edge_case():
    """
    Test Case 3: Ambiguous Edge Case.
    A legitimate early-stage startup using a free Gmail address and slight urgency ('immediately') without asking for money.
    Should trigger contact/urgency flags but NOT reach HIGH risk because no upfront payment/fake check is demanded.
    """
    payload = {
        "jobDescription": "Remote marketing coordinator needed for our fast-paced startup environment. Please email your resume and design portfolio immediately to our team at startup-careers-team@gmail.com.",
        "companyName": "NextGen Marketing Co",
        "recruiterEmail": "startup-careers-team@gmail.com"
    }
    response = client.post("/predict", json=payload)
    assert response.status_code == 200
    data = response.json()

    # Probability should be moderate or low depending on exact keywords, but not critical/high (<70)
    assert data["scamProbability"] <= 70
    assert data["riskLevel"] in ["LOW", "MEDIUM"]
    assert data["signals"]["hasSuspiciousContact"] is True
    assert data["signals"]["hasUpfrontFeeDemand"] is False
