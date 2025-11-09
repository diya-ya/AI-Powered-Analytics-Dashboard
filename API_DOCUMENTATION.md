# API Documentation

This document describes all API endpoints available in the Analytics Dashboard application.

## Base URL

- **Development**: `http://localhost:3001/api`
- **Production**: `https://your-app.vercel.app/api`

## Authentication

Currently, no authentication is required. In production, you should add authentication middleware.

## Endpoints

### 1. Get Statistics

Returns overview metrics for the dashboard cards.

**Endpoint**: `GET /api/stats`

**Response**:
```json
{
  "totalSpendYTD": 12679.25,
  "totalSpendChange": 8.2,
  "totalInvoices": 64,
  "invoiceChange": 8.2,
  "documentsThisMonth": 17,
  "documentsChange": -8,
  "averageInvoiceValue": 2455.00,
  "averageInvoiceValueChange": 8.2
}
```

### 2. Get Invoice Trends

Returns monthly invoice count and spend for the last 12 months.

**Endpoint**: `GET /api/invoice-trends`

**Response**:
```json
[
  {
    "month": "Jan",
    "year": 2024,
    "invoiceCount": 5,
    "totalSpend": 1234.56
  },
  ...
]
```

### 3. Get Top 10 Vendors

Returns top 10 vendors by total spend.

**Endpoint**: `GET /api/vendors/top10`

**Response**:
```json
[
  {
    "vendorName": "AcmeCorp",
    "spend": 8679.25,
    "percentage": 35.2,
    "cumulativePercentage": 35.2
  },
  ...
]
```

### 4. Get Category Spend

Returns spending grouped by category.

**Endpoint**: `GET /api/category-spend`

**Response**:
```json
[
  {
    "category": "Operations",
    "spend": 1000.00,
    "percentage": 40.0
  },
  {
    "category": "Marketing",
    "spend": 7250.00,
    "percentage": 50.0
  },
  ...
]
```

### 5. Get Cash Outflow Forecast

Returns expected cash outflow grouped by due date ranges.

**Endpoint**: `GET /api/cash-outflow`

**Response**:
```json
[
  {
    "range": "0-7 days",
    "amount": 5000.00
  },
  {
    "range": "8-30 days",
    "amount": 10000.00
  },
  {
    "range": "31-60 days",
    "amount": 15000.00
  },
  {
    "range": "60+ days",
    "amount": 8000.00
  }
]
```

### 6. Get Invoices

Returns paginated list of invoices with optional search and sorting.

**Endpoint**: `GET /api/invoices`

**Query Parameters**:
- `search` (optional): Search by vendor name or invoice ID
- `page` (optional, default: 1): Page number
- `limit` (optional, default: 50): Items per page
- `sortBy` (optional, default: "invoiceDate"): Field to sort by
- `sortOrder` (optional, default: "desc"): "asc" or "desc"

**Example**: `GET /api/invoices?search=Acme&page=1&limit=20&sortBy=vendor&sortOrder=asc`

**Response**:
```json
{
  "invoices": [
    {
      "id": "uuid",
      "invoiceId": "1234",
      "invoiceDate": "2025-11-04T00:00:00.000Z",
      "deliveryDate": "2015-01-31T00:00:00.000Z",
      "vendor": "Musterfirma Müller",
      "amount": 358.79,
      "status": "processed",
      "dueDate": "2025-12-04T00:00:00.000Z",
      "documentId": "19f79fd4-382e-4e00-9782-dab154fa6fec"
    },
    ...
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 100,
    "totalPages": 2
  }
}
```

### 7. Chat with Data

Processes natural language queries and returns SQL + results.

**Endpoint**: `POST /api/chat-with-data`

**Request Body**:
```json
{
  "query": "What's the total spend in the last 90 days?"
}
```

**Response**:
```json
{
  "response": "The total spend in the last 90 days is €12,679.25",
  "sql": "SELECT SUM(invoice_total) FROM summaries s JOIN invoices i ON s.document_id = i.document_id WHERE i.invoice_date >= NOW() - INTERVAL '90 days'",
  "data": [
    {
      "sum": 12679.25
    }
  ]
}
```

**Error Response**:
```json
{
  "error": "Failed to process query with Vanna AI"
}
```

## Error Responses

All endpoints may return the following error responses:

**400 Bad Request**:
```json
{
  "error": "Invalid request parameters"
}
```

**500 Internal Server Error**:
```json
{
  "error": "Failed to fetch data"
}
```

## Rate Limiting

Currently, no rate limiting is implemented. In production, consider adding rate limiting middleware.

## CORS

CORS is enabled for all origins in development. In production, restrict to your frontend domain.

