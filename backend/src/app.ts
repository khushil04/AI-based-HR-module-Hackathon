import cors from "cors";
import express from "express";
import { isAllowedOrigin } from "./config/cors";
import authRoutes from "./routes/authRoutes";
import notificationRoutes from "./routes/notificationRoutes";
import employeeRoutes from "./routes/employeeRoutes";
import attendanceRoutes from "./routes/attendanceRoutes";
import leaveRoutes from "./routes/leaveRoutes";
import payrollRoutes from "./routes/payrollRoutes";
import jobRoutes from "./routes/jobRoutes";
import aiRoutes from "./routes/aiRoutes";
import dashboardRoutes from "./routes/dashboardRoutes";

const app = express();

app.use(
  cors({
    origin: (origin, callback) => {
      callback(null, isAllowedOrigin(origin));
    },
    credentials: true,
  }),
);
app.use(express.json());
// Express 5 leaves req.body undefined on POST with no JSON payload (e.g. check-in)
app.use((req, _res, next) => {
  if (req.body === undefined) {
    req.body = {};
  }
  next();
});

app.get("/", (_req, res) => {
  res.status(200).json({
    service: "AI-HRMS Backend API",
    status: "running",
    message:
      "This is the API server only. Open the React app at http://localhost:5173 — do not use this URL as the main app.",
    endpoints: {
      health: "/api/health",
      auth: "/api/auth",
      notifications: "/api/notifications",
      socket: "Socket.io on this host (path /socket.io)",
    },
  });
});

app.get("/api/health", (_req, res) => {
  res.status(200).json({ status: "ok", service: "backend", socket: true });
});

app.use("/api/auth", authRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/leaves", leaveRoutes);
app.use("/api/payroll", payrollRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/notifications", notificationRoutes);

export default app;
