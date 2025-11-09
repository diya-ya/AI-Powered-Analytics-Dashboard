import '@/lib/env-init';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const now = new Date();
    const months: { month: number; year: number; label: string }[] = [];
    
    // Get last 12 months
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        month: date.getMonth(),
        year: date.getFullYear(),
        label: date.toLocaleString('en-US', { month: 'short' }),
      });
    }

    const trends = await Promise.all(
      months.map(async ({ month, year, label }) => {
        const startDate = new Date(year, month, 1);
        const endDate = new Date(year, month + 1, 0, 23, 59, 59);

        const invoices = await prisma.invoice.findMany({
          where: {
            invoiceDate: {
              gte: startDate,
              lte: endDate,
            },
          },
          include: {
            document: {
              include: {
                summary: true,
              },
            },
          },
        });

        const invoiceCount = invoices.length;
        const totalSpend = invoices.reduce((sum, inv) => {
          const total = inv.document.summary?.invoiceTotal || 0;
          return sum + Math.abs(total);
        }, 0);

        return {
          month: label,
          year,
          invoiceCount,
          totalSpend,
        };
      })
    );

    return NextResponse.json(trends);
  } catch (error) {
    console.error('Invoice trends error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoice trends' },
      { status: 500 }
    );
  }
}

