import '@/lib/env-init';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const sortBy = searchParams.get('sortBy') || 'invoiceDate';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { invoiceId: { contains: search, mode: 'insensitive' } },
        {
          document: {
            vendor: {
              vendorName: { contains: search, mode: 'insensitive' },
            },
          },
        },
      ];
    }

    const orderBy: any = {};
    if (sortBy === 'vendor') {
      orderBy.document = {
        vendor: {
          vendorName: sortOrder,
        },
      };
    } else if (sortBy === 'amount') {
      orderBy.document = {
        summary: {
          invoiceTotal: sortOrder,
        },
      };
    } else {
      orderBy[sortBy] = sortOrder;
    }

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          document: {
            include: {
              vendor: true,
              summary: true,
              payment: true,
            },
          },
        },
      }),
      prisma.invoice.count({ where }),
    ]);

    const result = invoices.map((invoice) => ({
      id: invoice.id,
      invoiceId: invoice.invoiceId,
      invoiceDate: invoice.invoiceDate,
      deliveryDate: invoice.deliveryDate,
      vendor: invoice.document.vendor?.vendorName || 'Unknown',
      amount: Math.abs(invoice.document.summary?.invoiceTotal || 0),
      status: invoice.document.status,
      dueDate: invoice.document.payment?.dueDate,
      documentId: invoice.document.fileId,
    }));

    return NextResponse.json({
      invoices: result,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Invoices error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoices' },
      { status: 500 }
    );
  }
}

