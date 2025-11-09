import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Total Spend (YTD)
    const ytdSpend = await prisma.summary.aggregate({
      where: {
        invoiceTotal: { not: null },
        document: {
          invoice: {
            invoiceDate: { gte: startOfYear },
          },
        },
      },
      _sum: {
        invoiceTotal: true,
      },
    });

    const lastMonthSpend = await prisma.summary.aggregate({
      where: {
        invoiceTotal: { not: null },
        document: {
          invoice: {
            invoiceDate: {
              gte: startOfLastMonth,
              lte: endOfLastMonth,
            },
          },
        },
      },
      _sum: {
        invoiceTotal: true,
      },
    });

    const currentMonthSpend = await prisma.summary.aggregate({
      where: {
        invoiceTotal: { not: null },
        document: {
          invoice: {
            invoiceDate: { gte: startOfMonth },
          },
        },
      },
      _sum: {
        invoiceTotal: true,
      },
    });

    // Total Invoices Processed
    const totalInvoices = await prisma.invoice.count({
      where: {
        invoiceDate: { gte: startOfYear },
      },
    });

    const lastMonthInvoices = await prisma.invoice.count({
      where: {
        invoiceDate: {
          gte: startOfLastMonth,
          lte: endOfLastMonth,
        },
      },
    });

    const currentMonthInvoices = await prisma.invoice.count({
      where: {
        invoiceDate: { gte: startOfMonth },
      },
    });

    // Documents Uploaded This Month
    const documentsThisMonth = await prisma.document.count({
      where: {
        createdAt: { gte: startOfMonth },
      },
    });

    const documentsLastMonth = await prisma.document.count({
      where: {
        createdAt: {
          gte: startOfLastMonth,
          lte: endOfLastMonth,
        },
      },
    });

    // Average Invoice Value
    const avgInvoiceValue = await prisma.summary.aggregate({
      where: {
        invoiceTotal: { not: null },
        document: {
          invoice: {
            invoiceDate: { gte: startOfYear },
          },
        },
      },
      _avg: {
        invoiceTotal: true,
      },
    });

    const avgInvoiceValueLastMonth = await prisma.summary.aggregate({
      where: {
        invoiceTotal: { not: null },
        document: {
          invoice: {
            invoiceDate: {
              gte: startOfLastMonth,
              lte: endOfLastMonth,
            },
          },
        },
      },
      _avg: {
        invoiceTotal: true,
      },
    });

    const totalSpendYTD = ytdSpend._sum.invoiceTotal || 0;
    const totalSpendLastMonth = lastMonthSpend._sum.invoiceTotal || 0;
    const totalSpendCurrentMonth = currentMonthSpend._sum.invoiceTotal || 0;
    const spendChange = totalSpendLastMonth > 0
      ? ((totalSpendCurrentMonth - totalSpendLastMonth) / totalSpendLastMonth) * 100
      : 0;

    const invoiceChange = lastMonthInvoices > 0
      ? ((currentMonthInvoices - lastMonthInvoices) / lastMonthInvoices) * 100
      : 0;

    const documentsChange = documentsLastMonth - documentsThisMonth;

    const avgValue = avgInvoiceValue._avg.invoiceTotal || 0;
    const avgValueLastMonth = avgInvoiceValueLastMonth._avg.invoiceTotal || 0;
    const avgValueChange = avgValueLastMonth > 0
      ? ((avgValue - avgValueLastMonth) / avgValueLastMonth) * 100
      : 0;

    return NextResponse.json({
      totalSpendYTD: Math.abs(totalSpendYTD),
      totalSpendChange: spendChange,
      totalInvoices,
      invoiceChange,
      documentsThisMonth,
      documentsChange,
      averageInvoiceValue: Math.abs(avgValue),
      averageInvoiceValueChange: avgValueChange,
    });
  } catch (error) {
    console.error('Stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}

