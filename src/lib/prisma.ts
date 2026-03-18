// Import generated Prisma client
import { PrismaClient } from "../generated/prisma/client";

// Import SQLite adapter
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

// Create SQLite adapter
const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || "file:./dev.db",
});

// Create Prisma client instance
const prisma = new PrismaClient({
  adapter,
});

// Export Prisma client
export default prisma;