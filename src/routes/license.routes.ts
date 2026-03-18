// Import Express router types
import { Router, Request, Response } from "express";

// Import Prisma client
import prisma from "../lib/prisma";
import { generateLicenseKey } from "../utils/generate-license-key";

// Create router instance
const licenseRouter = Router();

// License validation route
licenseRouter.post("/validate", async (req: Request, res: Response) => {
      try {
            const { licenseKey } = req.body;

            // Basic input validation
            if (!licenseKey || typeof licenseKey !== "string") {
                  return res.status(400).json({
                        success: false,
                        status: "invalid_request",
                        message: "licenseKey is required",
                  });
            }

            // Find license by key
            const license = await prisma.license.findUnique({
                  where: {
                        licenseKey,
                  },
            });

            // License not found
            if (!license) {
                  return res.status(404).json({
                        success: false,
                        status: "invalid",
                        message: "License key is invalid",
                  });
            }

            // License manually revoked
            if (license.status === "revoked") {
                  return res.status(403).json({
                        success: false,
                        status: "revoked",
                        message: "License has been revoked",
                  });
            }

            const now = new Date();

            // First activation flow
            if (!license.firstActivatedAt || !license.expiresAt) {
                  const expiresAt = new Date(now);
                  expiresAt.setDate(expiresAt.getDate() + license.durationDays);

                  const activatedLicense = await prisma.license.update({
                        where: {
                              id: license.id,
                        },
                        data: {
                              firstActivatedAt: now,
                              expiresAt,
                        },
                  });

                  return res.status(200).json({
                        success: true,
                        status: "active",
                        message: "License activated successfully",
                        expiresAt: activatedLicense.expiresAt,
                        firstActivatedAt: activatedLicense.firstActivatedAt,
                  });
            }

            // Expired license check
            if (now > license.expiresAt) {
                  return res.status(403).json({
                        success: false,
                        status: "expired",
                        message: "License has expired",
                        expiresAt: license.expiresAt,
                  });
            }

            // Valid active license
            return res.status(200).json({
                  success: true,
                  status: "active",
                  message: "License is valid",
                  expiresAt: license.expiresAt,
                  firstActivatedAt: license.firstActivatedAt,
            });
      } catch (error) {
            console.error("License validation error:", error);

            return res.status(500).json({
                  success: false,
                  status: "server_error",
                  message: "Internal server error",
            });
      }
});

// License creation route
licenseRouter.post("/create", async (req: Request, res: Response) => {
      try {

            //console.log("ADMIN_SECRET from env:", process.env.ADMIN_SECRET);
            //console.log("ADMIN_SECRET from header:", req.headers["x-admin-secret"]);

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
export default licenseRouter;