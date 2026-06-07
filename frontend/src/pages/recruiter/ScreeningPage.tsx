import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import AppLayout from "../../components/common/AppLayout";
import Alert from "../../components/ui/Alert";
import PageHeader from "../../components/ui/PageHeader";
import Panel from "../../components/ui/Panel";
import {
  createJobApi,
  listJobsApi,
  listResumesApi,
  screenResumeApi,
} from "../../services/aiApi";

const ScreeningPage = () => {
  const [jobs, setJobs] = useState<Array<{ _id: string; title: string; description: string }>>([]);
  const [resumes, setResumes] = useState<Array<Record<string, unknown>>>([]);
  const [jobId, setJobId] = useState("");
  const [candidateName, setCandidateName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [newJobTitle, setNewJobTitle] = useState("");
  const [newJobDept, setNewJobDept] = useState("");
  const [newJobDesc, setNewJobDesc] = useState("");

  const load = async () => {
    const [j, r] = await Promise.all([listJobsApi(), listResumesApi()]);
    setJobs(j);
    setResumes(r);
    if (j[0] && !jobId) setJobId(j[0]._id);
  };

  useEffect(() => {
    void load();
  }, []);

  const handleCreateJob = async (e: FormEvent) => {
    e.preventDefault();
    await createJobApi({
      title: newJobTitle,
      department: newJobDept,
      description: newJobDesc,
    });
    setNewJobTitle("");
    setNewJobDept("");
    setNewJobDesc("");
    await load();
  };

  const handleScreen = async (e: FormEvent) => {
    e.preventDefault();
    if (!file || !jobId || !candidateName) return;
    setLoading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("jobId", jobId);
      fd.append("candidateName", candidateName);
      const data = await screenResumeApi(fd);
      setResult(data.resume as Record<string, unknown>);
      await load();
    } catch {
      setError("Screening failed. Ensure AI service is running on port 8000.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout title="Resume Screening">
      <PageHeader description="Upload PDF resumes and match candidates against job descriptions with AI scoring." />

      {error && <Alert>{error}</Alert>}

      <div className="grid-2-equal">
        <Panel title="Create job">
        <form onSubmit={handleCreateJob}>
          <label>
            Title
            <input value={newJobTitle} onChange={(e) => setNewJobTitle(e.target.value)} required />
          </label>
          <label>
            Department
            <input value={newJobDept} onChange={(e) => setNewJobDept(e.target.value)} required />
          </label>
          <label>
            Description (JD)
            <textarea
              rows={4}
              value={newJobDesc}
              onChange={(e) => setNewJobDesc(e.target.value)}
              required
            />
          </label>
          <button type="submit" className="btn btn-primary btn-block">Save job</button>
        </form>
        </Panel>

        <Panel title="Screen resume (PDF)">
        <form onSubmit={handleScreen}>
          <label>
            Job
            <select value={jobId} onChange={(e) => setJobId(e.target.value)} required>
              <option value="">Select job</option>
              {jobs.map((j) => (
                <option key={j._id} value={j._id}>
                  {j.title}
                </option>
              ))}
            </select>
          </label>
          <label>
            Candidate name
            <input
              value={candidateName}
              onChange={(e) => setCandidateName(e.target.value)}
              required
            />
          </label>
          <label>
            PDF file
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              required
            />
          </label>
          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? "Screening..." : "Screen resume"}
          </button>
        </form>
        </Panel>
      </div>

      {result && (
        <Panel title="Latest result">
          <h3>Latest result — {String(result.candidateName)}</h3>
          <p>
            Match: <strong>{String(result.matchScore)}%</strong> · ATS:{" "}
            <strong>{String(result.atsScore)}%</strong> · Rank:{" "}
            <span className={`badge badge-${String(result.ranking).toLowerCase()}`}>
              {String(result.ranking)}
            </span>
          </p>
          <p>
            Skills: {(result.skills as string[])?.join(", ") || "—"}
          </p>
        </Panel>
      )}

      <Panel title="Ranked candidates">
        <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Match</th>
              <th>ATS</th>
              <th>Rank</th>
            </tr>
          </thead>
          <tbody>
            {resumes.map((r) => (
              <tr key={String(r._id)}>
                <td>{String(r.candidateName)}</td>
                <td>{String(r.matchScore)}%</td>
                <td>{String(r.atsScore)}%</td>
                <td>{String(r.ranking)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </Panel>
    </AppLayout>
  );
};

export default ScreeningPage;
