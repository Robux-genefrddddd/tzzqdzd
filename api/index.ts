import { VercelRequest, VercelResponse } from "@vercel/node";
import serverless from "serverless-http";
import { createServer } from "../server";

// Create the Express app
const app = createServer();

// Wrap with serverless-http for Vercel
const handler = serverless(app);

// Export the handler for Vercel
export default handler;
