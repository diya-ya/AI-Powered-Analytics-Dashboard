// This file must be imported before any Prisma code
// It transforms the DATABASE_URL from Neon's format to Prisma's expected format

if (process.env.DATABASE_URL?.startsWith('postgresql+psycopg://')) {
  process.env.DATABASE_URL = process.env.DATABASE_URL.replace(
    'postgresql+psycopg://',
    'postgresql://'
  );
}

