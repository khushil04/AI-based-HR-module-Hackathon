# AI Features API (Steps 8–11)

## Architecture

```
Frontend → Backend (/api/ai) → AI Service (port 8000) → OpenAI/Gemini (optional)
```

## AI Service (FastAPI)

Run:

```bash
cd ai-service
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

| Endpoint | Description |
|----------|-------------|
| POST `/resume/screen` | PDF + job description → match score |
| POST `/interview/upload-answer` | Audio → transcript |
| POST `/interview/evaluate-answer` | Q&A → score + feedback |
| POST `/chat` | HR chatbot reply |

## Backend proxy routes

| Method | Route | Roles |
|--------|-------|-------|
| POST | `/api/ai/screen-resume` | ADMIN, MANAGER, RECRUITER |
| GET | `/api/ai/resumes` | ADMIN, MANAGER, RECRUITER |
| POST | `/api/ai/upload-answer` | ADMIN, MANAGER, RECRUITER |
| POST | `/api/ai/evaluate-answer` | ADMIN, MANAGER, RECRUITER, EMPLOYEE |
| POST | `/api/ai/chat` | All authenticated |
| POST | `/api/ai/interviews` | ADMIN, MANAGER, RECRUITER |
| GET | `/api/ai/interviews` | ADMIN, MANAGER, RECRUITER |
| GET | `/api/dashboard` | All authenticated |

## Socket.io

Connect to backend with JWT:

```javascript
socket.emit('authenticate', token);
```

Rooms: `admin-room`, `manager-room`, `recruiter-room`, `employee-room`

Events: `notification` (leave, attendance, candidate, interview)

## Optional LLM keys

Set in `ai-service/.env`:

- `OPENAI_API_KEY` — chat, interview evaluation, Whisper (future)
- `GEMINI_API_KEY` — alternative LLM

Without keys, resume screening uses TF-IDF; chat/interview use rule-based fallbacks.
