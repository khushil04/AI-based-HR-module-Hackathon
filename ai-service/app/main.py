from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import chat, interview, resume

app = FastAPI(title="AI-HRMS AI Service", version="0.2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(resume.router)
app.include_router(interview.router)
app.include_router(chat.router)


@app.get("/health")
def health():
    return {"status": "ok", "service": "ai-service"}
