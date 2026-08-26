"""Fine-tune Gemma 3 270M for JanaNiti's non-decisional civic draft-assist task.

This script intentionally refuses to train on unlabelled reports and never learns
priority, verification, assignment, or status decisions. Use only a reviewed,
consented JSONL dataset matching ai/civic_ai_contract.json. It saves a small LoRA
adapter, not a copy of the base model.
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path


ALLOWED_CATEGORIES = {"Waste & sanitation", "Water", "Road safety", "Streetlight", "Other"}
PROHIBITED_KEYS = {"priority", "drfiScore", "verification", "status", "assignment", "moderationDecision"}


def validate_example(example: dict) -> dict:
    if set(example) != {"input", "output"}:
        raise ValueError("Each training example must contain only input and output.")
    source, output = example["input"], example["output"]
    if not isinstance(source, dict) or not isinstance(output, dict):
        raise ValueError("input and output must be objects.")
    if PROHIBITED_KEYS.intersection(source) or PROHIBITED_KEYS.intersection(output):
        raise ValueError("Training data must not contain civic decision fields.")
    if output.get("category") not in ALLOWED_CATEGORIES:
        raise ValueError("output.category is not an allowed JanaNiti category.")
    if not isinstance(source.get("title"), str) or not isinstance(source.get("description"), str) or not isinstance(source.get("locality"), str):
        raise ValueError("input requires title, description, and locality strings.")
    if not isinstance(output.get("summary"), str) or len(output["summary"]) > 500:
        raise ValueError("output.summary must be a string of 500 characters or fewer.")
    missing = output.get("missingFields", [])
    if not isinstance(missing, list) or len(missing) > 5 or not all(isinstance(item, str) for item in missing):
        raise ValueError("output.missingFields must be at most five strings.")
    if output.get("confidence") not in {"low", "medium", "high"}:
        raise ValueError("output.confidence must be low, medium, or high.")
    return example


def load_examples(path: Path) -> list[dict]:
    examples = [validate_example(json.loads(line)) for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]
    if len(examples) < 100:
        raise ValueError("Provide at least 100 reviewed, consented examples before fine-tuning.")
    return examples


def format_example(example: dict) -> str:
    input_data, output_data = example["input"], example["output"]
    return (
        "You are JanaNiti Draft Assist. Return JSON only. Suggest category, short summary, missing factual details, and confidence. "
        "Never decide priority, DRFI, verification, status, assignment, or moderation.\n"
        f"Report: {json.dumps(input_data, ensure_ascii=False)}\n"
        f"Suggestion: {json.dumps(output_data, ensure_ascii=False)}"
    )


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--dataset", required=True, type=Path, help="Reviewed, consented JSONL dataset.")
    parser.add_argument("--output", required=True, type=Path, help="Directory for the LoRA adapter.")
    parser.add_argument("--base-model", default="google/gemma-3-270m-it")
    parser.add_argument("--epochs", default=3, type=int)
    args = parser.parse_args()
    examples = load_examples(args.dataset)

    from datasets import Dataset
    from peft import LoraConfig, get_peft_model
    from transformers import AutoModelForCausalLM, AutoTokenizer, DataCollatorForLanguageModeling, Trainer, TrainingArguments

    tokenizer = AutoTokenizer.from_pretrained(args.base_model)
    model = AutoModelForCausalLM.from_pretrained(args.base_model)
    model = get_peft_model(model, LoraConfig(r=8, lora_alpha=16, lora_dropout=0.05, target_modules=["q_proj", "v_proj"], task_type="CAUSAL_LM"))
    dataset = Dataset.from_dict({"text": [format_example(example) for example in examples]})
    tokenized = dataset.map(lambda row: tokenizer(row["text"], truncation=True, max_length=1024), batched=True, remove_columns=["text"])
    trainer = Trainer(
        model=model,
        args=TrainingArguments(output_dir=str(args.output), num_train_epochs=args.epochs, per_device_train_batch_size=1, gradient_accumulation_steps=8, learning_rate=2e-4, logging_steps=10, save_strategy="epoch"),
        train_dataset=tokenized,
        data_collator=DataCollatorForLanguageModeling(tokenizer=tokenizer, mlm=False),
    )
    trainer.train()
    model.save_pretrained(args.output)
    tokenizer.save_pretrained(args.output)
    print(f"Saved non-decisional JanaNiti draft-assist adapter to {args.output}")


if __name__ == "__main__":
    main()
