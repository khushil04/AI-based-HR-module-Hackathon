import { useCallback, useEffect, useState } from "react";
import AppLayout from "../../components/common/AppLayout";
import Alert from "../../components/ui/Alert";
import EmptyState from "../../components/ui/EmptyState";
import LoadingState from "../../components/ui/LoadingState";
import PageHeader from "../../components/ui/PageHeader";
import Pagination from "../../components/ui/Pagination";
import Panel from "../../components/ui/Panel";
import StatCard from "../../components/ui/StatCard";
import { getAttendanceReportApi, listAttendanceApi } from "../../services/attendanceApi";
import type { AttendanceRecord, AttendanceReport } from "../../types/attendance";
import { employeeLabel, formatDate, formatTime } from "../../utils/format";

const AttendancePage = () => {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [report, setReport] = useState<AttendanceReport | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [list, reportData] = await Promise.all([
        listAttendanceApi({ page, limit: 15 }),
        getAttendanceReportApi(),
      ]);
      setRecords(list.attendance);
      setTotalPages(list.pagination.totalPages);
      setReport(reportData);
    } catch {
      setError("Failed to load attendance data.");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <AppLayout title="Attendance">
      <PageHeader description="Monitor check-ins, check-outs, and daily attendance across your organization." />

      {report && (
        <div className="stats-grid">
          <StatCard icon="✓" value={report.summary.present} label="Present" accent />
          <StatCard icon="🕐" value={report.summary.withCheckIn} label="Checked in" />
          <StatCard icon="🌴" value={report.summary.onLeave} label="On leave" />
          <StatCard icon="📋" value={report.summary.totalRecords} label="Total records" />
        </div>
      )}

      {error && <Alert>{error}</Alert>}

      <Panel title="Attendance records">
        {loading ? (
          <LoadingState label="Loading attendance..." />
        ) : records.length === 0 ? (
          <EmptyState
            icon="📅"
            title="No attendance records yet"
            message="Records appear when employees check in from My Attendance."
          />
        ) : (
          <>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Date</th>
                    <th>Check in</th>
                    <th>Check out</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((r) => (
                    <tr key={r.id}>
                      <td>
                        <strong>{employeeLabel(r.employeeId)}</strong>
                      </td>
                      <td>{formatDate(r.date)}</td>
                      <td>{formatTime(r.checkIn)}</td>
                      <td>{formatTime(r.checkOut)}</td>
                      <td>
                        <span className={`badge badge-${r.status.toLowerCase().replace("_", "-")}`}>
                          {r.status.replace("_", " ")}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </>
        )}
      </Panel>
    </AppLayout>
  );
};

export default AttendancePage;
