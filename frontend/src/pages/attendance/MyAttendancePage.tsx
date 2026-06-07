import { useCallback, useEffect, useState } from "react";
import AppLayout from "../../components/common/AppLayout";
import Alert from "../../components/ui/Alert";
import EmptyState from "../../components/ui/EmptyState";
import LoadingState from "../../components/ui/LoadingState";
import PageHeader from "../../components/ui/PageHeader";
import Panel from "../../components/ui/Panel";
import axios from "axios";
import {
  checkInApi,
  checkOutApi,
  getTodayApi,
  listAttendanceApi,
} from "../../services/attendanceApi";
import type { AttendanceRecord, TodayStatus } from "../../types/attendance";
import { formatDate, formatTime } from "../../utils/format";

const extractError = (err: unknown, fallback: string) => {
  if (axios.isAxiosError(err) && err.response?.data?.message) {
    return String(err.response.data.message);
  }
  return fallback;
};

const MyAttendancePage = () => {
  const [today, setToday] = useState<TodayStatus | null>(null);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [todayData, listData] = await Promise.all([
        getTodayApi(),
        listAttendanceApi({ page: 1, limit: 10 }),
      ]);
      setToday(todayData);
      setRecords(listData.attendance);
    } catch (err) {
      setError(extractError(err, "Could not load attendance."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleCheckIn = async () => {
    setActionLoading(true);
    setError(null);
    try {
      await checkInApi();
      await load();
    } catch (err) {
      setError(extractError(err, "Check-in failed."));
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setActionLoading(true);
    setError(null);
    try {
      await checkOutApi();
      await load();
    } catch (err) {
      setError(extractError(err, "Check-out failed."));
    } finally {
      setActionLoading(false);
    }
  };

  const canCheckIn = !today?.today?.checkIn;
  const canCheckOut = today?.today?.checkIn && !today?.today?.checkOut;

  return (
    <AppLayout title="My Attendance">
      <PageHeader description="Mark your daily attendance and review your history." />

      {loading ? (
        <LoadingState />
      ) : (
        <>
          <Panel title="Today">
            <div className="checkin-hero">
              <div>
                <p className="muted" style={{ margin: "0 0 4px" }}>
                  {today?.employee.name}
                </p>
                {today?.today ? (
                  <p className="checkin-times">
                    In: <strong>{formatTime(today.today.checkIn)}</strong>
                    <span className="sep">·</span>
                    Out: <strong>{formatTime(today.today.checkOut)}</strong>
                  </p>
                ) : (
                  <p className="muted">Not checked in yet today</p>
                )}
              </div>
              <div className="checkin-actions">
                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={!canCheckIn || actionLoading}
                  onClick={handleCheckIn}
                >
                  Check in
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  disabled={!canCheckOut || actionLoading}
                  onClick={handleCheckOut}
                >
                  Check out
                </button>
              </div>
            </div>
          </Panel>

          {error && <Alert>{error}</Alert>}

          <Panel title="Recent history">
            {records.length === 0 ? (
              <EmptyState icon="📅" title="No history yet" message="Your attendance will show here." />
            ) : (
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Check in</th>
                      <th>Check out</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((r) => (
                      <tr key={r.id}>
                        <td>{formatDate(r.date)}</td>
                        <td>{formatTime(r.checkIn)}</td>
                        <td>{formatTime(r.checkOut)}</td>
                        <td>{r.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Panel>
        </>
      )}
    </AppLayout>
  );
};

export default MyAttendancePage;
