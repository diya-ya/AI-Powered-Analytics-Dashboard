import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface JsonDocument {
  _id: string;
  name: string;
  filePath?: string;
  fileSize?: { $numberLong?: string };
  fileType?: string;
  status?: string;
  organizationId?: string;
  departmentId?: string;
  createdAt?: { $date?: string };
  updatedAt?: { $date?: string };
  uploadedById?: string;
  isValidatedByHuman?: boolean;
  analyticsId?: string;
  extractedData?: {
    llmData?: {
      invoice?: {
        value?: {
          invoiceId?: { value?: string };
          invoiceDate?: { value?: string };
          deliveryDate?: { value?: string };
        };
      };
      vendor?: {
        value?: {
          vendorName?: { value?: string };
          vendorPartyNumber?: { value?: string };
          vendorAddress?: { value?: string };
          vendorTaxId?: { value?: string };
        };
      };
      customer?: {
        value?: {
          customerName?: { value?: string };
          customerAddress?: { value?: string };
        };
      };
      payment?: {
        value?: {
          dueDate?: { value?: string };
          paymentTerms?: { value?: string };
          bankAccountNumber?: { value?: string };
          BIC?: { value?: string };
          accountName?: { value?: string };
          netDays?: { value?: number };
          discountPercentage?: { value?: string | number };
          discountDays?: { value?: number };
          discountDueDate?: { value?: string };
          discountedTotal?: { value?: string | number };
        };
      };
      summary?: {
        value?: {
          documentType?: { value?: string };
          subTotal?: { value?: number };
          totalTax?: { value?: number };
          invoiceTotal?: { value?: number };
          currencySymbol?: { value?: string };
        };
      };
      lineItems?: {
        value?: {
          items?: Array<{
            srNo?: { value?: number };
            description?: { value?: string };
            quantity?: { value?: number };
            unitPrice?: { value?: number };
            totalPrice?: { value?: number };
            Sachkonto?: { value?: string };
            BUSchluessel?: { value?: string };
          }>;
        };
      };
    };
  };
}

function parseDate(dateStr?: string): Date | null {
  if (!dateStr) return null;
  try {
    return new Date(dateStr);
  } catch {
    return null;
  }
}

function parseNumber(value?: string | number): number | null {
  if (value === undefined || value === null || value === '') return null;
  if (typeof value === 'number') return value;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? null : parsed;
}

async function seed() {
  console.log('Starting data ingestion...');

  const dataPath = path.join(process.cwd(), '../../data/Analytics_Test_Data.json');
  const fileContent = fs.readFileSync(dataPath, 'utf-8');
  const documents: JsonDocument[] = JSON.parse(fileContent);

  console.log(`Found ${documents.length} documents to process`);

  let processed = 0;
  let errors = 0;

  for (const doc of documents) {
    try {
      const fileSize = doc.fileSize?.$numberLong 
        ? parseInt(doc.fileSize.$numberLong) 
        : null;

      const createdAt = doc.createdAt?.$date 
        ? parseDate(doc.createdAt.$date) 
        : new Date();

      const updatedAt = doc.updatedAt?.$date 
        ? parseDate(doc.updatedAt.$date) 
        : new Date();

      // Check if analyticsId already exists (to avoid unique constraint violation)
      let analyticsId = doc.analyticsId;
      if (analyticsId) {
        const existing = await prisma.document.findUnique({
          where: { analyticsId },
        });
        if (existing && existing.fileId !== doc._id) {
          // AnalyticsId already exists for a different document, set to null
          analyticsId = null;
        }
      }

      // Create document
      const document = await prisma.document.upsert({
        where: { fileId: doc._id },
        update: {},
        create: {
          fileId: doc._id,
          name: doc.name,
          filePath: doc.filePath,
          fileSize: fileSize,
          fileType: doc.fileType,
          status: doc.status || 'processed',
          organizationId: doc.organizationId,
          departmentId: doc.departmentId,
          createdAt: createdAt,
          updatedAt: updatedAt,
          uploadedById: doc.uploadedById,
          isValidatedByHuman: doc.isValidatedByHuman || false,
          analyticsId: analyticsId,
        },
      });

      const llmData = doc.extractedData?.llmData;

      // Create invoice
      if (llmData?.invoice?.value) {
        const inv = llmData.invoice.value;
        await prisma.invoice.upsert({
          where: { documentId: document.id },
          update: {},
          create: {
            documentId: document.id,
            invoiceId: inv.invoiceId?.value,
            invoiceDate: inv.invoiceDate?.value ? parseDate(inv.invoiceDate.value) : null,
            deliveryDate: inv.deliveryDate?.value ? parseDate(inv.deliveryDate.value) : null,
          },
        });
      }

      // Create vendor
      if (llmData?.vendor?.value) {
        const ven = llmData.vendor.value;
        await prisma.vendor.upsert({
          where: { documentId: document.id },
          update: {},
          create: {
            documentId: document.id,
            vendorName: ven.vendorName?.value,
            vendorPartyNumber: ven.vendorPartyNumber?.value,
            vendorAddress: ven.vendorAddress?.value,
            vendorTaxId: ven.vendorTaxId?.value,
          },
        });
      }

      // Create customer
      if (llmData?.customer?.value) {
        const cust = llmData.customer.value;
        await prisma.customer.upsert({
          where: { documentId: document.id },
          update: {},
          create: {
            documentId: document.id,
            customerName: cust.customerName?.value,
            customerAddress: cust.customerAddress?.value,
          },
        });
      }

      // Create payment
      if (llmData?.payment?.value) {
        const pay = llmData.payment.value;
        await prisma.payment.upsert({
          where: { documentId: document.id },
          update: {},
          create: {
            documentId: document.id,
            dueDate: pay.dueDate?.value ? parseDate(pay.dueDate.value) : null,
            paymentTerms: pay.paymentTerms?.value || null,
            bankAccountNumber: pay.bankAccountNumber?.value || null,
            bic: pay.BIC?.value || null,
            accountName: pay.accountName?.value || null,
            netDays: pay.netDays?.value || 0,
            discountPercentage: parseNumber(pay.discountPercentage?.value),
            discountDays: pay.discountDays?.value || 0,
            discountDueDate: pay.discountDueDate?.value ? parseDate(pay.discountDueDate.value) : null,
            discountedTotal: parseNumber(pay.discountedTotal?.value),
          },
        });
      }

      // Create summary
      if (llmData?.summary?.value) {
        const sum = llmData.summary.value;
        await prisma.summary.upsert({
          where: { documentId: document.id },
          update: {},
          create: {
            documentId: document.id,
            documentType: sum.documentType?.value || null,
            subTotal: parseNumber(sum.subTotal?.value),
            totalTax: parseNumber(sum.totalTax?.value),
            invoiceTotal: parseNumber(sum.invoiceTotal?.value),
            currencySymbol: sum.currencySymbol?.value || null,
          },
        });
      }

      // Create line items
      if (llmData?.lineItems?.value?.items) {
        const items = llmData.lineItems.value.items;
        // Check if items is an array
        if (Array.isArray(items) && items.length > 0) {
          // Delete existing line items
          await prisma.lineItem.deleteMany({
            where: { documentId: document.id },
          });

          for (const item of items) {
            await prisma.lineItem.create({
              data: {
                documentId: document.id,
                srNo: item.srNo?.value || 0,
                description: item.description?.value || null,
                quantity: parseNumber(item.quantity?.value),
                unitPrice: parseNumber(item.unitPrice?.value),
                totalPrice: parseNumber(item.totalPrice?.value),
                sachkonto: item.Sachkonto?.value || null,
                buSchluessel: item.BUSchluessel?.value || null,
              },
            });
          }
        }
      }

      processed++;
      if (processed % 100 === 0) {
        console.log(`Processed ${processed}/${documents.length} documents...`);
      }
    } catch (error) {
      errors++;
      console.error(`Error processing document ${doc._id}:`, error);
    }
  }

  console.log(`\n✅ Data ingestion complete!`);
  console.log(`   Processed: ${processed}`);
  console.log(`   Errors: ${errors}`);
}

seed()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

