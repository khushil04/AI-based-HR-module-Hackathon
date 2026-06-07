import http from "http";
import app from "./app";
import { connectDB } from "./config/db";
import { env } from "./config/env";
import { initSocket } from "./sockets/index";

const startServer = async (): Promise<void> => {
  try {
    await connectDB();
    const httpServer = http.createServer(app);
    initSocket(httpServer);

    httpServer.listen(env.port, () => {
      console.log(`Backend listening on port ${env.port}`);
    });
  } catch (error) {
    console.error("Server start failed:", error);
    process.exit(1);
  }
};

void startServer();
