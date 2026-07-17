# Model Artifacts Directory (`scam_classifier`)

**NOTE ON MODEL EVALUATION AND BENCHMARKING:**
This directory is reserved for storing fine-tuned PyTorch / Hugging Face model checkpoints (`pytorch_model.bin`, `config.json`, `tokenizer.json`) and scikit-learn vectorized feature pipelines (`tfidf_vectorizer.pkl`).

Per Phase 4 rules:
- No fabricated accuracy, F1-score, or precision/recall metrics are reported or assumed at this stage.
- The service currently utilizes a hybrid pretrained baseline (`distilbert-base-uncased` + rule/statistical feature extraction).
- Real fine-tuning, empirical evaluation, and benchmark validation against real-world datasets such as **EMSCAD (Employment Scam Aegean Dataset)** or equivalent labeled job fraud corpora are strictly scheduled for **Phase 7: Testing and Deployment**.
