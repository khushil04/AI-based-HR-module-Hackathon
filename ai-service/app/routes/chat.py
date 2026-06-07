from fastapi import APIRouter
from pydantic import BaseModel

from app.services.chatbot import chat_response

router = APIRouter(prefix="/chat", tags=["chat"])


class ChatBody(BaseModel):
    message: str
    context: str = ""


@router.post("")
async def chat(body: ChatBody):
    reply = await chat_response(body.message, body.context)
    return {"reply": reply}
