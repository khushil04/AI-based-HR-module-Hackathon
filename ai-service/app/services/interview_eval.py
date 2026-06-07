import json
import re

from app.services.llm import call_llm


def heuristic_evaluate(question: str, answer: str) -> dict:
    words = answer.split()
    length_score = min(100, len(words) * 3)
    keyword_hits = sum(1 for token in question.lower().split() if token in answer.lower())
    relevance = min(40, keyword_hits * 10)
    clarity = 20 if len(words) > 20 else 10
    score = min(100, length_score * 0.4 + relevance + clarity)
    return {
        "score": round(score, 2),
        "feedback": "Heuristic evaluation (connect OPENAI_API_KEY or GEMINI_API_KEY for deeper analysis).",
        "strengths": ["Answer provided"] if answer.strip() else [],
        "improvements": ["Add more specific examples"] if len(words) < 30 else [],
    }


async def evaluate_answer(question: str, answer: str, role: str = "candidate") -> dict:
    llm_response = await call_llm(
        f"""Evaluate this interview answer for role context: {role}.
Question: {question}
Answer: {answer}

Return JSON only with keys: score (0-100), feedback (string), strengths (array), improvements (array)."""
    )

    if llm_response:
        try:
            match = re.search(r"\{.*\}", llm_response, re.S)
            if match:
                parsed = json.loads(match.group())
                return {
                    "score": float(parsed.get("score", 0)),
                    "feedback": parsed.get("feedback", ""),
                    "strengths": parsed.get("strengths", []),
                    "improvements": parsed.get("improvements", []),
                }
        except (json.JSONDecodeError, ValueError, TypeError):
            pass

    return heuristic_evaluate(question, answer)


async def transcribe_audio_placeholder(filename: str) -> str:
    return (
        f"[Transcript placeholder for {filename}. "
        "Set OPENAI_API_KEY and enable Whisper API integration for real speech-to-text.]"
    )
