import { env } from "./env";

export const isAllowedOrigin = (origin: string | undefined): boolean => {
  if (!origin) return true;
  if (env.clientOrigins.includes(origin)) return true;
  return /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
};
