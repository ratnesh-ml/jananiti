# JanaNiti small-model scaffold

The selected model is **Gemma 3 270M IT**, a compact Google model designed for task-specific fine-tuning. This repository does not include model files, civic-report data, credentials, or fabricated training examples.

The only approved task is **civic draft assistance**: category suggestion, short editable summary, and missing-detail prompts. It must never calculate or alter DRFI, determine truth, change a lifecycle status, assign an officer, decide moderation, or publish a report.

To train, first review and consent a minimum of 100 de-identified, human-labelled examples that follow `civic_ai_contract.json`, accept Gemma’s license, and use a secure GPU-capable environment. Then install the training dependencies in that isolated environment and run `train_gemma_lora.py`. The saved adapter is served by `serve_gemma.py` on a trusted service such as Cloud Run only after explicit billing approval. The Vercel function will call the service only when `CIVIC_AI_ENDPOINT` and `CIVIC_AI_API_KEY` are configured as server-side secrets.
