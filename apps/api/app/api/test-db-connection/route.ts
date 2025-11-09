import '@/lib/env-init';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Test 1: Check if URL was transformed
    const originalUrl = process.env.DATABASE_URL || '';
    const isTransformed = !originalUrl.startsWith('postgresql+psycopg://');
    
    // Test 2: Test database connection
    await prisma.$connect();
    
    // Test 3: Run a simple query
    const result = await prisma.$queryRaw<Array<{now: Date}>>`SELECT NOW() as now`;
    
    // Test 4: Check if tables exist
    const tables = await prisma.$queryRaw<Array<{table_name: string}>>`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      LIMIT 5
    `;
    
    // Test 5: Count documents
    const docCount = await prisma.document.count();
    
    return NextResponse.json({
      status: 'success',
      connection: 'working',
      urlTransformed: isTransformed,
      urlPreview: originalUrl.substring(0, 30) + '...',
      databaseTime: result[0]?.now,
      tablesFound: tables.length,
      tableNames: tables.map(t => t.table_name),
      documentCount: docCount,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      error: error.message,
      errorCode: error.code,
      errorName: error.name,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

