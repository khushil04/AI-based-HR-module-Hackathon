from fastapi import APIRouter, File, Form, UploadFile

from app.services.screening import ats_compatibility_score, extract_skills, similarity_score
from app.utils.pdf_extractor import extract_text_from_pdf

router = APIRouter(prefix="/resume", tags=["resume"])


@router.post("/screen")
async def screen_resume(
    file: UploadFile = File(...),
    job_description: str = Form(...),
    candidate_name: str = Form(""),
):
    content = await file.read()
    resume_text = extract_text_from_pdf(content)
    if not resume_text:
        return {
            "extractedText": "",
            "skills": [],
            "matchScore": 0,
            "atsScore": 0,
            "ranking": "LOW",
            "message": "Could not extract text from PDF",
        }

    match = similarity_score(resume_text, job_description)
    ats = ats_compatibility_score(resume_text)
    skills = extract_skills(resume_text)

    if match >= 75:
        ranking = "HIGH"
    elif match >= 50:
        ranking = "MEDIUM"
    else:
        ranking = "LOW"

    return {
        "candidateName": candidate_name,
        "extractedText": resume_text[:4000],
        "skills": skills,
        "matchScore": match,
        "atsScore": ats,
        "ranking": ranking,
    }
