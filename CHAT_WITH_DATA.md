# Chat with Data - Workflow Documentation

This document explains how the "Chat with Data" feature works, from user query to displayed results.

## Overview

The Chat with Data feature allows users to ask natural language questions about their invoice and vendor data. The system converts these questions into SQL queries, executes them against the PostgreSQL database, and returns both the SQL and results in a user-friendly format.

## Architecture

```
User Input (Frontend)
    ↓
Next.js API Route (/api/chat-with-data)
    ↓
Vanna AI Service (Python FastAPI)
    ↓
Groq LLM (SQL Generation)
    ↓
PostgreSQL Database
    ↓
Results (JSON)
    ↓
Frontend Display
```

## Components

### 1. Frontend (`apps/web/app/chat/page.tsx`)

- **Chat Interface**: Text input and message display
- **Message History**: Shows user queries and AI responses
- **SQL Display**: Shows generated SQL queries
- **Results Table**: Displays query results in a table format

### 2. Backend API (`apps/api/app/api/chat-with-data/route.ts`)

- **Proxy Service**: Forwards requests to Vanna AI service
- **Error Handling**: Catches and formats errors
- **CORS**: Handles cross-origin requests

### 3. Vanna AI Service (`services/vanna/app.py`)

- **Natural Language Processing**: Uses Vanna AI to understand queries
- **SQL Generation**: Uses Groq LLM to generate SQL
- **Query Execution**: Executes SQL against PostgreSQL
- **Response Generation**: Creates natural language responses

## Workflow Steps

### Step 1: User Submits Query

User types a question like:
```
"What's the total spend in the last 90 days?"
```

### Step 2: Frontend Sends Request

```typescript
const response = await fetch("/api/chat-with-data", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ query: "What's the total spend in the last 90 days?" }),
});
```

### Step 3: Backend Proxies to Vanna AI

The Next.js API route forwards the request to the Vanna AI service:

```typescript
const response = await fetch(`${vannaApiUrl}/api/chat`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ query }),
});
```

### Step 4: Vanna AI Processes Query

1. **Schema Understanding**: Vanna AI has been trained on the database schema
2. **SQL Generation**: Uses Groq LLM to generate SQL:
   ```python
   sql = vn.generate_sql(request.query)
   ```
   Example output:
   ```sql
   SELECT SUM(s.invoice_total) 
   FROM summaries s
   JOIN invoices i ON s.document_id = i.document_id
   WHERE i.invoice_date >= NOW() - INTERVAL '90 days'
   ```

### Step 5: Execute SQL Query

```python
with conn.cursor(cursor_factory=RealDictCursor) as cur:
    cur.execute(sql)
    results = cur.fetchall()
    data = [dict(row) for row in results]
```

### Step 6: Generate Natural Language Response

```python
response = vn.generate_response(
    sql=sql,
    question=request.query,
    df=None
)
```

Example: "The total spend in the last 90 days is €12,679.25"

### Step 7: Return Structured Response

```json
{
  "response": "The total spend in the last 90 days is €12,679.25",
  "sql": "SELECT SUM(s.invoice_total) FROM summaries s...",
  "data": [
    { "sum": 12679.25 }
  ]
}
```

### Step 8: Frontend Displays Results

- **Message Bubble**: Shows natural language response
- **SQL Code Block**: Displays generated SQL (formatted)
- **Results Table**: Shows data in a table format

## Example Queries

### 1. Total Spend Query
**Input**: "What's the total spend in the last 90 days?"

**Generated SQL**:
```sql
SELECT SUM(s.invoice_total) 
FROM summaries s
JOIN invoices i ON s.document_id = i.document_id
WHERE i.invoice_date >= NOW() - INTERVAL '90 days'
```

**Response**: "The total spend in the last 90 days is €12,679.25"

### 2. Top Vendors Query
**Input**: "List top 5 vendors by spend."

**Generated SQL**:
```sql
SELECT v.vendor_name, SUM(ABS(s.invoice_total)) as total_spend
FROM vendors v
JOIN documents d ON v.document_id = d.id
JOIN summaries s ON s.document_id = d.id
WHERE s.invoice_total IS NOT NULL
GROUP BY v.vendor_name
ORDER BY total_spend DESC
LIMIT 5
```

**Response**: "Here are the top 5 vendors by spend: AcmeCorp (€8,679.25), Test Solutions (€5,234.10), ..."

### 3. Overdue Invoices Query
**Input**: "Show overdue invoices as of today."

**Generated SQL**:
```sql
SELECT i.invoice_id, v.vendor_name, s.invoice_total, p.due_date
FROM invoices i
JOIN documents d ON i.document_id = d.id
JOIN vendors v ON v.document_id = d.id
JOIN summaries s ON s.document_id = d.id
JOIN payments p ON p.document_id = d.id
WHERE p.due_date < NOW()
ORDER BY p.due_date ASC
```

**Response**: "Found 12 overdue invoices. The oldest is from AcmeCorp, due on 2024-01-15."

## Error Handling

### SQL Generation Failure
- **Cause**: Query too ambiguous or schema not understood
- **Response**: "I couldn't generate a SQL query for that question. Please try rephrasing."

### SQL Execution Error
- **Cause**: Invalid SQL or database error
- **Response**: "Error executing SQL query: [error message]"
- **SQL Still Shown**: User can see what was attempted

### Vanna AI Service Unavailable
- **Cause**: Service down or network issue
- **Response**: "Sorry, I encountered an error processing your query."
- **Frontend**: Shows error message to user

## Training Vanna AI

Vanna AI is automatically trained on the database schema when the service starts:

```python
# Get all tables
tables = ["documents", "invoices", "vendors", ...]

# Train on each table
for table in tables:
    vn.train(ddl=f"SELECT * FROM {table} LIMIT 1")
```

This allows Vanna to understand:
- Table names
- Column names
- Relationships between tables
- Common query patterns

## Security Considerations

1. **SQL Injection**: Vanna AI generates parameterized queries where possible
2. **Read-Only Access**: Consider using a read-only database user
3. **Query Limits**: Results are limited to 100 rows
4. **Input Validation**: Validate user queries before processing
5. **Rate Limiting**: Implement rate limiting in production

## Performance Optimization

1. **Caching**: Cache common queries and results
2. **Query Optimization**: Vanna AI generates optimized SQL
3. **Connection Pooling**: Use connection pooling for database
4. **Async Processing**: Consider async for long-running queries
5. **Result Pagination**: Implement pagination for large result sets

## Future Enhancements

1. **Query History**: Save and replay previous queries
2. **Query Suggestions**: Suggest similar queries
3. **Visualizations**: Auto-generate charts from results
4. **Export Results**: Download results as CSV/Excel
5. **Query Templates**: Pre-built query templates
6. **Multi-language Support**: Support queries in multiple languages

