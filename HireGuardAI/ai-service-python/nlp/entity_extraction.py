"""
Rule/Regex-Based Entity Extraction module for detecting high-risk scam signals in job posts.
Per Phase 4 rules: This is explicitly a rule-driven signal extractor (not a trained NER deep neural network).
"""
import re
from typing import Dict, List, Tuple


def extract_scam_signals(raw_text: str, recruiter_email: str = "") -> Tuple[Dict[str, bool], List[str], int]:
    """
    Extracts structured scam signals from job description text using domain-specific regex patterns.

    Args:
        raw_text (str): The raw or preprocessed job description text.
        recruiter_email (str): Optional recruiter email address to inspect for free webmail flags.

    Returns:
        Tuple[Dict[str, bool], List[str], int]:
            - Dict of signal flags (`hasUpfrontFeeDemand`, `hasUrgencyPhrases`, `hasUnrealisticSalary`, `hasSuspiciousContact`).
            - List of explainability reason strings corresponding to flagged signals.
            - Cumulative signal risk penalty (0 to 80 points) contributed by rules.
    """
    text_lower = raw_text.lower() if raw_text else ""
    email_lower = recruiter_email.lower().strip() if recruiter_email else ""

    signals = {
        "hasUpfrontFeeDemand": False,
        "hasUrgencyPhrases": False,
        "hasUnrealisticSalary": False,
        "hasSuspiciousContact": False,
    }
    reasons: List[str] = []
    rule_score_penalty = 0

    # 1. Upfront Payment / Equipment Deposit Fee Demands (Extremely High Risk)
    upfront_patterns = [
        r'\b(pay|wire|deposit|send)\s+(?:an?\s+)?(?:upfront|processing|equipment|training|registration)\s+(?:fee|cost|deposit)\b',
        r'\b(purchase|buy)\s+(?:your\s+own\s+)?(?:laptop|starter\s+kit|software)\s+from\s+our\s+(?:vendor|supplier)\b',
        r'\b(counterfeit\s+check|check\s+will\s+be\s+sent|wire\s+back|refund\s+the\s+difference)\b',
        r'\b\$?\d+(?:\.\d{2})?\s*(?:processing\s+fee|upfront\s+deposit)\b'
    ]
    for pat in upfront_patterns:
        if re.search(pat, text_lower):
            signals["hasUpfrontFeeDemand"] = True
            reasons.append("Flagged mandatory upfront payment/equipment deposit or check refund scheme (High Fraud Signal).")
            rule_score_penalty += 45
            break

    # 2. Urgency Phrases & High-Pressure Tactics
    urgency_patterns = [
        r'\b(act\s+now|immediate\s+hiring|hiring\s+immediately|start\s+today|limited\s+slots?\s+left)\b',
        r'\b(no\s+interview|no\s+experience\s+required|immediate\s+job\s+offer)\b',
        r'\b(apply\s+before\s+slots\s+fill|urgent\s+hiring\s+need)\b'
    ]
    for pat in urgency_patterns:
        if re.search(pat, text_lower):
            signals["hasUrgencyPhrases"] = True
            reasons.append("Flagged high-pressure urgency tactics ('act now', 'no interview needed', 'limited slots').")
            rule_score_penalty += 15
            break

    # 3. Unrealistic Salary / Easy Money Claims
    salary_patterns = [
        r'\b(earn\s+\$?\d{3,4}\s+(?:per|/)\s+(?:day|hour)\s+working\s+from\s+home)\b',
        r'\b(\$4[0-9]|\$5[0-9]|\$[6-9][0-9])\s*(?:per|/)\s*hour\s+(?:for\s+)?(?:data\s+entry|package\s+reshipment|basic\s+typing)\b',
        r'\b(guaranteed\s+weekly\s+income|easy\s+money|work\s+only\s+2\-3\s+hours\s+a\s+day\s+for\s+\$\d+)\b'
    ]
    for pat in salary_patterns:
        if re.search(pat, text_lower):
            signals["hasUnrealisticSalary"] = True
            reasons.append("Flagged unrealistic salary/easy money promises incompatible with entry-level duties.")
            rule_score_penalty += 20
            break

    # 4. Suspicious Contact Patterns & Free Webmail Domains (@gmail / @yahoo / @telegram)
    contact_patterns = [
        r'\b(telegram|whatsapp|signal)\s+(?:id|number|username|chat|group)\b',
        r'\b[a-z0-9._%+-]+@(?:gmail|yahoo|hotmail|outlook|protonmail)\.com\b'
    ]
    if any(re.search(pat, text_lower) for pat in contact_patterns) or any(domain in email_lower for domain in ["@gmail.com", "@yahoo.com", "@hotmail.com", "@outlook.com"]):
        signals["hasSuspiciousContact"] = True
        reasons.append("Flagged unofficial communication channel (Telegram/WhatsApp or unverified free webmail contact).")
        rule_score_penalty += 15

    return signals, reasons, min(rule_score_penalty, 85)
