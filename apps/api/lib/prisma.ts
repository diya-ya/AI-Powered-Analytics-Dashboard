import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Transform DATABASE_URL from postgresql+psycopg:// to postgresql:// for Prisma
// This needs to happen before PrismaClient is initialized
if (process.env.DATABASE_URL?.startsWith('postgresql+psycopg://')) {
  process.env.DATABASE_URL = process.env.DATABASE_URL.replace(
    'postgresql+psycopg://',
    'postgresql://'
  );
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

