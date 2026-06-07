import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import axios from "axios";
import AppLayout from "../../components/common/AppLayout";
import Alert from "../../components/ui/Alert";
import PageHeader from "../../components/ui/PageHeader";
import Panel from "../../components/ui/Panel";
import {
  createInterviewApi,
  evaluateAnswerApi,
  listInterviewsApi,
  uploadAnswerApi,
} from "../../services/aiApi";

const InterviewPage = () => {
  const [interviews, setInterviews] = useState<Array<Record<string, unknown>>>([]);
  const [candidateName, setCandidateName] = useState("");
  const [interviewId, setInterviewId] = useState("");
  const [question, setQuestion] = useState("Tell us about your relevant experience.");
  const [transcript, setTranscript] = useState("");
  const [audio, setAudio] = useState<File | null>(null);
  const [evaluation, setEvaluation] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const extractError = (err: unknown, fallback: string) => {
    if (axios.isAxiosError(err) && err.response?.data?.message) {
      return String(err.response.data.message);
    }
    return fallback;
  };

  const load = async () => {
    const data = await listInterviewsApi();
    setInterviews(data);
    if (data[0] && !interviewId) setInterviewId(String(data[0]._id));
  };

  useEffect(() => {
    void load();
  }, []);

  const scheduleInterview = async (e: FormEvent) => {
    e.preventDefault();
    const iv = await createInterviewApi({ candidateName });
    setInterviewId(iv._id);
    setCandidateName("");
    await load();
  };

  const uploadAnswer = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!interviewId) {
      setError("Schedule or select an interview first.");
      return;
    }
    if (!audio && !transcript.trim()) {
      setError("Upload a voice file or paste your answer in the transcript field.");
      return;
    }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("interviewId", interviewId);
      fd.append("question", question);
      if (audio) fd.append("file", audio);
      if (transcript.trim()) fd.append("transcript", transcript.trim());
      const res = await uploadAnswerApi(fd);
      setTranscript(res.transcript);
    } catch (err) {
      setError(extractError(err, "Upload failed."));
    } finally {
      setLoading(false);
    }
  };

  const runEvaluate = async () => {
    if (!transcript.trim()) {
      setError("Upload or paste an answer before evaluating.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const ev = await evaluateAnswerApi({
        interviewId,
        question,
        answer: transcript,
      });
      setEvaluation(ev);
      await load();
    } catch (err) {
      setError(extractError(err, "Evaluation failed."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout title="Interviews">
      <PageHeader description="Schedule interviews, upload voice answers, and get AI evaluation scores." />

      {error && <Alert>{error}</Alert>}

      <Panel title="Schedule interview">
      <form onSubmit={scheduleInterview}>
        <label>
          Candidate name
          <input value={candidateName} onChange={(e) => setCandidateName(e.target.value)} required />
        </label>
        <button type="submit" className="btn btn-primary">Schedule</button>
      </form>
      </Panel>

      <Panel title="Upload & evaluate answer">
      <form onSubmit={uploadAnswer}>
        <label>
          Interview
          <select value={interviewId} onChange={(e) => setInterviewId(e.target.value)}>
            {interviews.map((iv) => (
              <option key={String(iv._id)} value={String(iv._id)}>
                {String(iv.candidateName)} — {String(iv.status)}
              </option>
            ))}
          </select>
        </label>
        <label>
          Question
          <input value={question} onChange={(e) => setQuestion(e.target.value)} required />
        </label>
        <label>
          Voice file (optional)
          <input type="file" accept="audio/*" onChange={(e) => setAudio(e.target.files?.[0] ?? null)} />
        </label>
        <label>
          Transcript (or paste answer text)
          <textarea rows={4} value={transcript} onChange={(e) => setTranscript(e.target.value)} />
        </label>
        <div className="form-actions">
          <button type="submit" className="btn btn-secondary" disabled={loading}>
            Upload / transcribe
          </button>
          <button type="button" className="btn btn-primary" onClick={() => void runEvaluate()} disabled={loading}>
            Evaluate answer
          </button>
        </div>
      </form>
      </Panel>

      {evaluation && (
        <Panel title="Evaluation result">
          <h3>Evaluation — Score: {String(evaluation.score)}/100</h3>
          <p>{String(evaluation.feedback)}</p>
        </Panel>
      )}

      <Panel title="All interviews">
        <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Candidate</th>
              <th>Status</th>
              <th>Overall score</th>
            </tr>
          </thead>
          <tbody>
            {interviews.map((iv) => (
              <tr key={String(iv._id)}>
                <td>{String(iv.candidateName)}</td>
                <td>{String(iv.status)}</td>
                <td>{String(iv.overallScore)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </Panel>
    </AppLayout>
  );
};

export default InterviewPage;
