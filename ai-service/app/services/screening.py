import re
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


def extract_skills(text: str) -> list[str]:
    common = [
        "python",
        "javascript",
        "typescript",
        "react",
        "node",
        "java",
        "sql",
        "mongodb",
        "aws",
        "docker",
        "kubernetes",
        "machine learning",
        "ai",
        "fastapi",
        "express",
        "communication",
        "leadership",
        "agile",
        "scrum",
    ]
    lowered = text.lower()
    found = [skill for skill in common if skill in lowered]
    return found[:12]


def similarity_score(resume_text: str, job_description: str) -> float:
    if not resume_text.strip() or not job_description.strip():
        return 0.0
    vectorizer = TfidfVectorizer(stop_words="english")
    matrix = vectorizer.fit_transform([resume_text, job_description])
    score = cosine_similarity(matrix[0:1], matrix[1:2])[0][0]
    return round(float(score) * 100, 2)


def ats_compatibility_score(resume_text: str) -> float:
    checks = 0
    total = 5
    if len(resume_text) > 200:
        checks += 1
    if re.search(r"@\w+\.\w+", resume_text):
        checks += 1
    if re.search(r"\b(experience|education|skills|projects)\b", resume_text, re.I):
        checks += 1
    if re.search(r"\d{4}", resume_text):
        checks += 1
    if len(resume_text.split()) > 80:
        checks += 1
    return round((checks / total) * 100, 2)
