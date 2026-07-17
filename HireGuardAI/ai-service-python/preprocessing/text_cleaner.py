"""
Text Cleaner module for normalizing job post descriptions prior to NLP feature extraction and transformer inference.
"""
import re
from typing import str as StrType


def clean_text(raw_text: str) -> str:
    """
    Cleans raw job post descriptions by:
    1. Lowercasing all characters.
    2. Removing HTML tags (<...>).
    3. Replacing URLs with a standard token or stripping them cleanly.
    4. Removing non-alphanumeric special characters while preserving essential punctuation/currencies ($).
    5. Normalizing multiple consecutive whitespace characters into single spaces.

    Args:
        raw_text (str): The raw job description text submitted to the service.

    Returns:
        str: Cleaned and normalized text ready for tokenization and signal extraction.
    """
    if not raw_text or not isinstance(raw_text, str):
        return ""

    # 1. Lowercase text
    text = raw_text.lower()

    # 2. Remove HTML tags
    text = re.sub(r'<[^>]+>', ' ', text)

    # 3. Strip or normalize URLs/hyperlinks
    text = re.sub(r'https?://\S+|www\.\S+', ' [url] ', text)

    # 4. Remove excessive special characters except $ / @ / alphanumeric and basic spacing
    # Preserving $ helps detect upfront fee demands and salary anomalies
    # Preserving @ helps detect free webmail recruiter patterns
    text = re.sub(r'[^a-z0-9\s$@\.\-,!]', ' ', text)

    # 5. Normalize whitespace (collapse tabs, newlines, multiple spaces into single space)
    text = re.sub(r'\s+', ' ', text).strip()

    return text
