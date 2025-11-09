import '@/lib/env-init';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const now = new Date();
    const sevenDays = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const thirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const sixtyDays = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);

    const payments = await prisma.payment.findMany({
      where: {
        dueDate: { not: null },
      },
      include: {
        document: {
          include: {
            summary: true,
          },
        },
      },
    });

    let range0to7 = 0;
    let range8to30 = 0;
    let range31to60 = 0;
    let range60Plus = 0;

    payments.forEach((payment) => {
      if (!payment.dueDate) return;

      const invoiceTotal = Math.abs(payment.document.summary?.invoiceTotal || 0);

      if (payment.dueDate <= sevenDays) {
        range0to7 += invoiceTotal;
      } else if (payment.dueDate <= thirtyDays) {
        range8to30 += invoiceTotal;
      } else if (payment.dueDate <= sixtyDays) {
        range31to60 += invoiceTotal;
      } else {
        range60Plus += invoiceTotal;
      }
    });

    return NextResponse.json([
      {
        range: '0-7 days',
        amount: range0to7,
      },
      {
        range: '8-30 days',
        amount: range8to30,
      },
      {
        range: '31-60 days',
        amount: range31to60,
      },
      {
        range: '60+ days',
        amount: range60Plus,
      },
    ]);
  } catch (error) {
    console.error('Cash outflow error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cash outflow' },
      { status: 500 }
    );
  }
}

