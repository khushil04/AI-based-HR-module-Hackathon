import { Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import HomePage from "./pages/HomePage";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import RecruiterDashboardPage from "./pages/recruiter/RecruiterDashboardPage";
import EmployeeDashboardPage from "./pages/employee/EmployeeDashboardPage";
import EmployeesPage from "./pages/employees/EmployeesPage";
import EmployeeDetailPage from "./pages/employees/EmployeeDetailPage";
import EmployeeFormPage from "./pages/employees/EmployeeFormPage";
import AttendancePage from "./pages/attendance/AttendancePage";
import MyAttendancePage from "./pages/attendance/MyAttendancePage";
import LeavesPage from "./pages/leaves/LeavesPage";
import PayrollPage from "./pages/payroll/PayrollPage";
import PayslipDetailPage from "./pages/payroll/PayslipDetailPage";
import PayrollFormPage from "./pages/payroll/PayrollFormPage";
import MyPayslipsPage from "./pages/payroll/MyPayslipsPage";
import ScreeningPage from "./pages/recruiter/ScreeningPage";
import InterviewPage from "./pages/recruiter/InterviewPage";
import ProtectedRoute from "./routes/ProtectedRoute";

const App = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute allowedRoles={["ADMIN", "MANAGER", "RECRUITER", "EMPLOYEE"]}>
            <HomePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={["ADMIN", "MANAGER"]}>
            <AdminDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/recruiter"
        element={
          <ProtectedRoute allowedRoles={["RECRUITER", "ADMIN", "MANAGER"]}>
            <RecruiterDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/employee"
        element={
          <ProtectedRoute allowedRoles={["EMPLOYEE", "ADMIN", "MANAGER"]}>
            <EmployeeDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/employees"
        element={
          <ProtectedRoute allowedRoles={["ADMIN", "MANAGER", "RECRUITER"]}>
            <EmployeesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/employees/new"
        element={
          <ProtectedRoute allowedRoles={["ADMIN", "MANAGER"]}>
            <EmployeeFormPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/employees/:id/edit"
        element={
          <ProtectedRoute allowedRoles={["ADMIN", "MANAGER"]}>
            <EmployeeFormPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/employees/:id"
        element={
          <ProtectedRoute allowedRoles={["ADMIN", "MANAGER", "RECRUITER"]}>
            <EmployeeDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/attendance"
        element={
          <ProtectedRoute allowedRoles={["ADMIN", "MANAGER"]}>
            <AttendancePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-attendance"
        element={
          <ProtectedRoute allowedRoles={["EMPLOYEE", "ADMIN", "MANAGER"]}>
            <MyAttendancePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/leaves"
        element={
          <ProtectedRoute allowedRoles={["ADMIN", "MANAGER", "EMPLOYEE"]}>
            <LeavesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/payroll"
        element={
          <ProtectedRoute allowedRoles={["ADMIN", "MANAGER"]}>
            <PayrollPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/payroll/new"
        element={
          <ProtectedRoute allowedRoles={["ADMIN", "MANAGER"]}>
            <PayrollFormPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/payroll/:id/edit"
        element={
          <ProtectedRoute allowedRoles={["ADMIN", "MANAGER"]}>
            <PayrollFormPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/payroll/:id"
        element={
          <ProtectedRoute allowedRoles={["ADMIN", "MANAGER", "EMPLOYEE"]}>
            <PayslipDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-payslips"
        element={
          <ProtectedRoute allowedRoles={["EMPLOYEE"]}>
            <MyPayslipsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/screening"
        element={
          <ProtectedRoute allowedRoles={["ADMIN", "MANAGER", "RECRUITER"]}>
            <ScreeningPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/interviews"
        element={
          <ProtectedRoute allowedRoles={["ADMIN", "MANAGER", "RECRUITER"]}>
            <InterviewPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
