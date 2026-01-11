import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { handleDownload } from "./routes/download";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Download proxy endpoint - bypasses CORS issues
  // Usage: GET /api/download?filePath=assets/assetId/filename&fileName=display-name
  app.get("/api/download", handleDownload);

  return app;
}
