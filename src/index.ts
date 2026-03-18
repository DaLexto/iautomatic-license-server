import "dotenv/config";

// Import Express
import express, { Request, Response } from "express";

// Import routes
import licenseRouter from "./routes/license.routes";
import adminRouter from "./routes/admin.routes";

// Create Express app
const app = express();

// Define port from environment or fallback
const PORT = Number(process.env.PORT) || 3000;

// Enable JSON body parsing
app.use(express.json());

// Basic health check route
app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "iAutomatic license server is running",
    environment: process.env.NODE_ENV || "development",
  });
});

// Mount public license routes
app.use("/license", licenseRouter);

// Mount admin routes
app.use("/admin", adminRouter);

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});