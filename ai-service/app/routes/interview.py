from fastapi import APIRouter, File, Form, UploadFile
from pydantic import BaseModel

from app.services.interview_eval import evaluate_answer, transcribe_audio_placeholder

router = APIRouter(prefix="/interview", tags=["interview"])


class EvaluateBody(BaseModel):
    question: str
    answer: str
    role: str = "candidate"


@router.post("/upload-answer")
async def upload_answer(
    question: str = Form(""),
    transcript: str = Form(""),
    file: UploadFile | None = File(None),
):
    if transcript.strip():
        text = transcript.strip()
    elif file is not None:
        text = await transcribe_audio_placeholder(file.filename or "audio.webm")
    else:
        text = ""

    return {"question": question, "transcript": text}


@router.post("/evaluate-answer")
async def evaluate_answer_route(body: EvaluateBody):
    result = await evaluate_answer(body.question, body.answer, body.role)
    return result
