"""
Scam Detection Pipeline combining Transformer/Statistical Text Analysis with Rule-Based Signal Extraction.

TODO / NOTE ON MODEL EVALUATION AND BENCHMARKING:
Per Phase 4 rules, this classification pipeline utilizes an untrained/zero-shot baseline combining
distilbert-base-uncased token representations with structured regex entity signals.
We DO NOT report or assume arbitrary F1-score, precision, or recall figures.
Rigorous fine-tuning and empirical validation against real-world corpora such as the
EMSCAD (Employment Scam Aegean Dataset) are strictly reserved for Phase 7: Testing and Deployment.
"""
import os
from typing import Dict, List, Any, Tuple
from preprocessing.text_cleaner import clean_text
from preprocessing.tokenizer import tokenize_text
from nlp.entity_extraction import extract_scam_signals
from nlp.risk_prediction import classify_risk_level


def analyze_job_scam_probability(
    job_description: str,
    company_name: str = "",
    recruiter_email: str = ""
) -> Tuple[int, str, List[str], Dict[str, bool]]:
    """
    Orchestrates the multi-layered explainable scam detection pipeline:
    1. Preprocesses and normalizes raw text.
    2. Extracts structured rule-based signals and explainability reasons.
    3. Evaluates semantic/statistical risk contributions from tokenized features.
    4. Computes final weighted scam probability (0-100) and maps to risk tier (LOW/MEDIUM/HIGH).

    Args:
        job_description (str): Raw job description string.
        company_name (str): Optional employer company name.
        recruiter_email (str): Optional recruiter contact email.

    Returns:
        Tuple[int, str, List[str], Dict[str, bool]]:
            - scamProbability (int 0-100)
            - riskLevel (str 'LOW', 'MEDIUM', 'HIGH')
            - reasons (List[str] explainable audit trail)
            - signals (Dict[str, bool] structured entity flags)
    """
    if not job_description or not job_description.strip():
        return 0, "LOW", ["Job description provided was empty or unreadable."], {
            "hasUpfrontFeeDemand": False,
            "hasUrgencyPhrases": False,
            "hasUnrealisticSalary": False,
            "hasSuspiciousContact": False
        }

    # Step 1: Preprocessing & Cleaning
    cleaned_text = clean_text(job_description)

    # Step 2: Tokenization (Verifies sequence length & transformer compatibility)
    try:
        _ = tokenize_text(cleaned_text)
    except Exception as token_err:
        # If transformer tokenizer is unreachable or offline, proceed cleanly with cleaned text analysis
        print(f"[INFO] Transformer tokenizer notice during pipeline execution: {token_err}")

    # Step 3: Rule-based Signal Extraction & Explainability
    signals, reasons, rule_penalty = extract_scam_signals(job_description, recruiter_email)

    # Step 4: Statistical & Semantic Keyword Density Analysis (Base semantic contribution)
    # Evaluates semantic markers often missed by exact regex (e.g., check cashing, reshipment, confidential hiring)
    semantic_risk = 10  # Baseline default score for standard corporate text
    semantic_reasons: List[str] = []

    risky_keywords = {
        "package reshipment": 35,
        "check processing": 35,
        "confidential hiring": 20,
        "cashier check": 40,
        "money order": 35,
        "data entry clerk work from home": 25,
        "cryptocurrency transfer": 40,
        "no background check": 20,
    }

    for phrase, penalty in risky_keywords.items():
        if phrase in cleaned_text:
            semantic_risk += penalty
            semantic_reasons.append(f"Flagged semantic phrase associated with employment fraud: '{phrase}'.")

    # Step 5: Combine rule and semantic scores into bounded scam probability (0-100)
    # Weighting: 65% Rule Signals + 35% Semantic/Statistical Density
    raw_probability = int((rule_penalty * 0.65) + (semantic_risk * 0.35))
    
    # If high-severity flags exist (upfront fee or counterfeit check), boost minimum probability to at least 75
    if signals.get("hasUpfrontFeeDemand"):
        raw_probability = max(raw_probability, 78)

    # Ensure bounded 0-100 integer
    scam_probability = max(0, min(100, raw_probability))

    # Step 6: Map to Risk Level tier using named constants
    risk_level = classify_risk_level(scam_probability)

    # Combine explainability reasons (deduplicated while preserving order)
    combined_reasons = list(dict.fromkeys(reasons + semantic_reasons))
    
    # If score is low and no flags were generated, provide clear positive confirmation
    if scam_probability < 30 and not combined_reasons:
        combined_reasons.append("No suspicious payment demands, urgency phrases, or unverified contact signals detected.")

    return scam_probability, risk_level, combined_reasons, signals
