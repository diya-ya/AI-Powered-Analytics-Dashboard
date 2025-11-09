# Database Schema Documentation

This document describes the PostgreSQL database schema for the Analytics Dashboard application.

## Overview

The database is normalized into the following main tables:
- `documents` - File metadata and status
- `invoices` - Invoice information
- `vendors` - Vendor details
- `customers` - Customer information
- `payments` - Payment terms and bank details
- `summaries` - Invoice totals and tax information
- `line_items` - Individual line items from invoices

## Entity Relationship Diagram

```
documents (1) ──< (1) invoices
documents (1) ──< (1) vendors
documents (1) ──< (1) customers
documents (1) ──< (1) payments
documents (1) ──< (1) summaries
documents (1) ──< (*) line_items
```

## Tables

### documents

Stores file metadata and processing status.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Primary key |
| fileId | String (UNIQUE) | Original file ID from JSON |
| name | String | File name |
| filePath | String? | URL to file |
| fileSize | Int? | File size in bytes |
| fileType | String? | MIME type |
| status | String | Processing status (default: "processed") |
| organizationId | String? | Organization ID |
| departmentId | String? | Department ID |
| createdAt | DateTime | Creation timestamp |
| updatedAt | DateTime | Last update timestamp |
| uploadedById | String? | User ID who uploaded |
| isValidatedByHuman | Boolean | Human validation flag |
| analyticsId | String? (UNIQUE) | Analytics identifier |

**Indexes**:
- `status`
- `createdAt`

### invoices

Stores invoice-specific information.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Primary key |
| documentId | UUID (FK, UNIQUE) | Reference to documents |
| invoiceId | String? | Invoice number |
| invoiceDate | DateTime? | Invoice date |
| deliveryDate | DateTime? | Delivery date |

**Indexes**:
- `invoiceDate`
- `invoiceId`

### vendors

Stores vendor information.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Primary key |
| documentId | UUID (FK, UNIQUE) | Reference to documents |
| vendorName | String? | Vendor name |
| vendorPartyNumber | String? | Party number |
| vendorAddress | String? | Vendor address |
| vendorTaxId | String? | Tax identification number |

**Indexes**:
- `vendorName`

### customers

Stores customer information.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Primary key |
| documentId | UUID (FK, UNIQUE) | Reference to documents |
| customerName | String? | Customer name |
| customerAddress | String? | Customer address |

**Indexes**:
- `customerName`

### payments

Stores payment terms and bank details.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Primary key |
| documentId | UUID (FK, UNIQUE) | Reference to documents |
| dueDate | DateTime? | Payment due date |
| paymentTerms | String? | Payment terms description |
| bankAccountNumber | String? | Bank account number |
| bic | String? | BIC/SWIFT code |
| accountName | String? | Account holder name |
| netDays | Int | Net payment days (default: 0) |
| discountPercentage | Float? | Discount percentage |
| discountDays | Int | Discount days (default: 0) |
| discountDueDate | DateTime? | Discount due date |
| discountedTotal | Float? | Discounted total amount |

**Indexes**:
- `dueDate`

### summaries

Stores invoice totals and tax information.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Primary key |
| documentId | UUID (FK, UNIQUE) | Reference to documents |
| documentType | String? | Document type |
| subTotal | Float? | Subtotal amount |
| totalTax | Float? | Total tax amount |
| invoiceTotal | Float? | Total invoice amount |
| currencySymbol | String? | Currency symbol |

### line_items

Stores individual line items from invoices.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Primary key |
| documentId | UUID (FK) | Reference to documents |
| srNo | Int | Serial number |
| description | String? | Item description |
| quantity | Float? | Quantity |
| unitPrice | Float? | Unit price |
| totalPrice | Float? | Total price |
| sachkonto | String? | Account code (German accounting) |
| buSchluessel | String? | Business key (German accounting) |

**Indexes**:
- `documentId`

## Relationships

- Each `document` can have **one** `invoice`, `vendor`, `customer`, `payment`, and `summary`
- Each `document` can have **many** `line_items`
- All relationships use `ON DELETE CASCADE` to maintain referential integrity

## Data Types

- **UUID**: Universally unique identifier (primary keys)
- **String**: Variable-length text
- **Int**: Integer numbers
- **Float**: Floating-point numbers
- **DateTime**: Timestamp with timezone
- **Boolean**: True/false values

## Constraints

- All foreign keys have `ON DELETE CASCADE` to ensure data consistency
- Unique constraints on `fileId` and `analyticsId` in documents
- Unique constraint on `documentId` in related tables (one-to-one relationships)

## Sample Queries

### Get all invoices with vendor and totals
```sql
SELECT 
  i.invoice_id,
  i.invoice_date,
  v.vendor_name,
  s.invoice_total
FROM invoices i
JOIN documents d ON i.document_id = d.id
JOIN vendors v ON v.document_id = d.id
JOIN summaries s ON s.document_id = d.id
ORDER BY i.invoice_date DESC;
```

### Get top vendors by spend
```sql
SELECT 
  v.vendor_name,
  SUM(ABS(s.invoice_total)) as total_spend
FROM vendors v
JOIN documents d ON v.document_id = d.id
JOIN summaries s ON s.document_id = d.id
WHERE s.invoice_total IS NOT NULL
GROUP BY v.vendor_name
ORDER BY total_spend DESC
LIMIT 10;
```

### Get cash outflow by date range
```sql
SELECT 
  CASE
    WHEN p.due_date <= NOW() + INTERVAL '7 days' THEN '0-7 days'
    WHEN p.due_date <= NOW() + INTERVAL '30 days' THEN '8-30 days'
    WHEN p.due_date <= NOW() + INTERVAL '60 days' THEN '31-60 days'
    ELSE '60+ days'
  END as range,
  SUM(ABS(s.invoice_total)) as amount
FROM payments p
JOIN documents d ON p.document_id = d.id
JOIN summaries s ON s.document_id = d.id
WHERE p.due_date IS NOT NULL
GROUP BY range;
```

## Migration

The schema is managed using Prisma. To apply changes:

```bash
cd apps/api
npx prisma db push
```

To generate migrations:

```bash
npx prisma migrate dev --name migration_name
```

