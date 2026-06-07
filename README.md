# AI-Powered Human Resource Management System (AI-HRMS)

Initial scaffold for a multi-service HR platform with:

- `frontend` (React + TypeScript + Vite)
- `backend` (Node.js + Express + TypeScript + MongoDB)
- `ai-service` (FastAPI)
- `docs` (project and API docs)

## Quick Start

### 1) Backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

### 2) Frontend

```bash
cd frontend
npm install
npm run dev
```

### 3) AI Service

```bash
cd ai-service
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

## Current Implemented Modules

- Authentication APIs: `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
- JWT-based auth middleware (`protect`) and role middleware (`authorizeRoles`)
- React login flow with protected routes and role-aware pages
- Employee CRUD APIs with pagination and search (`/api/employees`)
- Employee UI: list, profile, create/edit forms (role-gated)
- Attendance: check-in/out, history, analytics report (`/api/attendance`)
- Leave requests and manager approvals (`/api/leaves`)
- Payroll: payslip generation, salary calculation, reports (`/api/payroll`)
- AI resume screening (PDF → TF-IDF match + ATS score)
- AI interview (upload answer, evaluate with LLM/heuristics)
- HR chatbot (`POST /api/ai/chat`)
- Socket.io real-time notifications by role
- Role-based dashboards with live stats (`/api/dashboard`)
- FastAPI AI service (resume, interview, chat)

See `docs/employees-api.md`, `docs/attendance-leaves-api.md`, `docs/payroll-api.md`, and `docs/ai-features-api.md`.

### Run all services

```bash
# Terminal 1 — AI service
cd ai-service && pip install -r requirements.txt && uvicorn app.main:app --reload --port 8000

# Terminal 2 — Backend
cd backend && npm run dev

# Terminal 3 — Frontend
cd frontend && npm run dev
```
