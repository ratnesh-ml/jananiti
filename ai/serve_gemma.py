"""Serve the approved JanaNiti Gemma adapter behind the CIVIC_AI_ENDPOINT contract.

Deploy this only on a trusted runtime with model storage and authentication; do
not expose it directly from a browser bundle. The Vercel client sends only an
authenticated, bounded drafting request to this service.
"""

from __future__ import annotations

import os

from fastapi import FastAPI, Header, HTTPException
from pydantic import BaseModel, Field

app = FastAPI()
API_KEY = os.environ.get("CIVIC_AI_API_KEY")
MODEL_BASE_PATH = os.environ.get("CIVIC_AI_MODEL_BASE_PATH")
MODEL_ADAPTER_PATH = os.environ.get("CIVIC_AI_MODEL_ADAPTER_PATH")


class Report(BaseModel):
    title: str = Field(min_length=8, max_length=160)
    description: str = Field(min_length=20, max_length=2000)
    locality: str = Field(min_length=2, max_length=120)


class Request(BaseModel):
    task: str
    constraints: dict
    report: Report


def check_authorization(authorization: str | None) -> None:
    if not API_KEY or authorization != f"Bearer {API_KEY}":
        raise HTTPException(status_code=401, detail="Unauthorized model request")


@app.post("/")
def draft_assist(request: Request, authorization: str | None = Header(default=None)):
    check_authorization(authorization)
    if request.task != "civic_draft_assist":
        raise HTTPException(status_code=400, detail="Unsupported task")
    if not MODEL_BASE_PATH or not MODEL_ADAPTER_PATH:
        raise HTTPException(status_code=503, detail="No approved JanaNiti model adapter is installed.")
    # The deployed service must lazily load the approved base model and reviewed
    # LoRA adapter from these paths, generate JSON matching civic_ai_contract.json,
    # validate it server-side, and return it. This scaffold intentionally does not
    # fabricate a suggestion while model assets and independent evaluation are absent.
    raise HTTPException(status_code=501, detail="Approved adapter inference has not been enabled after evaluation.")
