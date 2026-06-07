from app.services.llm import call_llm

HR_KNOWLEDGE = """
AI-HRMS helps with employees, attendance, leave, payroll, recruitment, and interviews.
Employees can check in/out, request leave, and view payslips.
Admins manage employees, approve leaves, run payroll, and screen resumes.
Recruiters manage jobs, candidates, and interviews.
"""


async def chat_response(message: str, context: str = "") -> str:
    prompt = f"""You are an HR assistant for AI-HRMS.
{HR_KNOWLEDGE}
User context: {context or "general"}
User: {message}
Reply concisely and helpfully as HR support."""

    llm = await call_llm(prompt)
    if llm.strip():
        return llm.strip()

    lowered = message.lower()
    if "leave" in lowered:
        return "Submit leave requests from the Leaves page. Managers approve pending requests."
    if "payroll" in lowered or "payslip" in lowered:
        return "View payslips under My Payslips (employees) or Payroll (admin/manager)."
    if "attendance" in lowered or "check in" in lowered:
        return "Use My Attendance to check in and check out for the day."
    if "resume" in lowered or "job" in lowered:
        return "Recruiters can screen resumes against job descriptions from the Screening page."
    return "I can help with HR policies, leave, attendance, payroll, and recruitment. What do you need?"
