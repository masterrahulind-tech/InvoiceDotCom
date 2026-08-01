import { PrismaClient } from "@prisma/client";
import { Pool, neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import ws from "ws";

// Set up WebSocket for Neon in Node.js environments (Next.js server)
neonConfig.webSocketConstructor = ws;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Initialize the Prisma Client with the Neon adapter
const createPrismaClient = () => {
  // If no DATABASE_URL is available (e.g. during build or some local dev), 
  // fallback to default PrismaClient without adapter if needed, 
  // but usually we want to ensure adapter is used if URL exists.
  const connectionString = process.env.DATABASE_URL || "";
  
  if (connectionString.includes("neon.tech")) {
    const pool = new Pool({ connectionString });
    const adapter = new PrismaNeon(pool);
    // @ts-ignore - adapter is valid but requires a fresh prisma generate, which might be locked locally by the dev server
    return new PrismaClient({ adapter });
  }

  return new PrismaClient();
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
