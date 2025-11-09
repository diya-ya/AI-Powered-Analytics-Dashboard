import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const vendors = await prisma.vendor.findMany({
      include: {
        document: {
          include: {
            summary: true,
          },
        },
      },
    });

    // Group by vendor name and sum spend
    const vendorSpendMap = new Map<string, number>();

    vendors.forEach((vendor) => {
      if (vendor.vendorName) {
        const total = vendor.document.summary?.invoiceTotal || 0;
        const current = vendorSpendMap.get(vendor.vendorName) || 0;
        vendorSpendMap.set(vendor.vendorName, current + Math.abs(total));
      }
    });

    // Sort and get top 10
    const topVendors = Array.from(vendorSpendMap.entries())
      .map(([name, spend]) => ({ name, spend }))
      .sort((a, b) => b.spend - a.spend)
      .slice(0, 10);

    // Calculate cumulative percentage
    const totalSpend = topVendors.reduce((sum, v) => sum + v.spend, 0);
    let cumulative = 0;

    const result = topVendors.map((vendor) => {
      cumulative += vendor.spend;
      return {
        vendorName: vendor.name,
        spend: vendor.spend,
        percentage: (vendor.spend / totalSpend) * 100,
        cumulativePercentage: (cumulative / totalSpend) * 100,
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Top vendors error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch top vendors' },
      { status: 500 }
    );
  }
}

