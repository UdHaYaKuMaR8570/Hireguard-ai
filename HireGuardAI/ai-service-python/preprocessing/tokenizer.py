"""
Tokenizer module wrapping Hugging Face Transformers AutoTokenizer for distilbert-base-uncased.
"""
import os
from typing import Dict, Any, Optional
from transformers import AutoTokenizer, PreTrainedTokenizerBase

# Lazy global initialization to prevent unnecessary heavy imports during quick module loads
_TOKENIZER_INSTANCE: Optional[PreTrainedTokenizerBase] = None


def get_tokenizer(model_name: Optional[str] = None) -> PreTrainedTokenizerBase:
    """
    Retrieves or initializes the Hugging Face AutoTokenizer singleton instance.

    Args:
        model_name (Optional[str]): Pretrained model name. Defaults to MODEL_NAME env var or distilbert-base-uncased.

    Returns:
        PreTrainedTokenizerBase: The initialized Hugging Face tokenizer instance.
    """
    global _TOKENIZER_INSTANCE
    if _TOKENIZER_INSTANCE is None:
        target_model = model_name or os.getenv("MODEL_NAME", "distilbert-base-uncased")
        try:
            _TOKENIZER_INSTANCE = AutoTokenizer.from_pretrained(target_model)
        except Exception as e:
            # Fallback for environments without internet connectivity or cache
            print(f"[WARNING] Could not load Hugging Face tokenizer '{target_model}' from hub: {e}. Attempting offline/cached initialization.")
            try:
                _TOKENIZER_INSTANCE = AutoTokenizer.from_pretrained(target_model, local_files_only=True)
            except Exception as offline_err:
                raise RuntimeError(f"Failed to initialize tokenizer '{target_model}'. Ensure internet connectivity or run 'python -m transformers.cli download {target_model}' for local caching. Error: {offline_err}")
    return _TOKENIZER_INSTANCE


def tokenize_text(clean_text: str, max_length: int = 512) -> Dict[str, Any]:
    """
    Tokenizes clean job description text into tensor inputs suitable for DistilBERT inference.

    Args:
        clean_text (str): Preprocessed text string.
        max_length (int): Maximum token sequence length (DistilBERT standard limit is 512).

    Returns:
        Dict[str, Any]: Dictionary containing 'input_ids' and 'attention_mask' lists/tensors.
    """
    tokenizer = get_tokenizer()
    inputs = tokenizer(
        clean_text,
        max_length=max_length,
        padding="max_length",
        truncation=True,
        return_tensors="pt"
    )
    return inputs
