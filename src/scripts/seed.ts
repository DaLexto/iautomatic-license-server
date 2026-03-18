// Import Prisma client
import prisma from "../lib/prisma";

// Seed main function
async function main(): Promise<void> {
  const license = await prisma.license.upsert({
    where: {
      licenseKey: "IAUTO-TEST-1234",
    },
    update: {},
    create: {
      licenseKey: "IAUTO-TEST-1234",
      status: "active",
      durationDays: 30,
      firstActivatedAt: null,
      expiresAt: null,
    },
  });

  console.log("Seeded license:", license);
}

// Run seed script
main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });