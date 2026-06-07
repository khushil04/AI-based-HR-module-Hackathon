import os
import httpx


async def call_llm(prompt: str) -> str:
    openai_key = os.getenv("OPENAI_API_KEY")
    gemini_key = os.getenv("GEMINI_API_KEY")

    if openai_key:
        async with httpx.AsyncClient(timeout=60.0) as client:
            res = await client.post(
                "https://api.openai.com/v1/chat/completions",
                headers={"Authorization": f"Bearer {openai_key}"},
                json={
                    "model": os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
                    "messages": [{"role": "user", "content": prompt}],
                    "temperature": 0.3,
                },
            )
            res.raise_for_status()
            return res.json()["choices"][0]["message"]["content"]

    if gemini_key:
        model = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={gemini_key}"
        async with httpx.AsyncClient(timeout=60.0) as client:
            res = await client.post(
                url,
                json={"contents": [{"parts": [{"text": prompt}]}]},
            )
            res.raise_for_status()
            data = res.json()
            return data["candidates"][0]["content"]["parts"][0]["text"]

    return ""
