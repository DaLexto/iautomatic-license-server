// Import Express types
import { Router, Request, Response } from "express";

// Import Prisma client
import prisma from "../lib/prisma";

// Import license key generator
import { generateLicenseKey } from "../utils/generate-license-key";

// Create router instance
const adminRouter = Router();

// Admin middleware for secret validation
adminRouter.use((req: Request, res: Response, next) => {
  const adminSecret = req.headers["x-admin-secret"];

  if (
    !adminSecret ||
    typeof adminSecret !== "string" ||
    adminSecret !== process.env.ADMIN_SECRET
  ) {
    return res.status(401).json({
      success: false,
      status: "unauthorized",
      message: "Unauthorized",
    });
  }

  next();
});

// License creation route
adminRouter.post("/license/create", async (req: Request, res: Response) => {
  try {
    const { durationDays } = req.body;

    // Basic input validation
    if (
      typeof durationDays !== "number" ||
      !Number.isInteger(durationDays) ||
      durationDays <= 0
    ) {
      return res.status(400).json({
        success: false,
        status: "invalid_request",
        message: "durationDays must be a positive integer",
      });
    }

    const licenseKey = generateLicenseKey();

    const createdLicense = await prisma.license.create({
      data: {
        licenseKey,
        status: "active",
        durationDays,
        firstActivatedAt: null,
        expiresAt: null,
      },
    });

    return res.status(201).json({
      success: true,
      status: "created",
      message: "License created successfully",
      license: {
        id: createdLicense.id,
        licenseKey: createdLicense.licenseKey,
        durationDays: createdLicense.durationDays,
        status: createdLicense.status,
        createdAt: createdLicense.createdAt,
      },
    });
  } catch (error) {
    console.error("License creation error:", error);

    return res.status(500).json({
      success: false,
      status: "server_error",
      message: "Internal server error",
    });
  }
});

// Export router
export default adminRouter;