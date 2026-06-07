import dotenv from "dotenv";

dotenv.config();

const requiredEnvVars = ["MONGO_URI", "JWT_SECRET"] as const;

requiredEnvVars.forEach((envVar) => {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
});

const defaultOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
];

export const env = {
  port: Number(process.env.PORT ?? 5000),
  mongoUri: process.env.MONGO_URI as string,
  jwtSecret: process.env.JWT_SECRET as string,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "1d",
  aiServiceUrl: process.env.AI_SERVICE_URL ?? "http://localhost:8000",
  clientOrigin: process.env.CLIENT_ORIGIN ?? "http://localhost:5173",
  clientOrigins: [
    ...new Set([
      ...(process.env.CLIENT_ORIGIN ?? "http://localhost:5173")
        .split(",")
        .map((o) => o.trim())
        .filter(Boolean),
      ...defaultOrigins,
    ]),
  ],
};
