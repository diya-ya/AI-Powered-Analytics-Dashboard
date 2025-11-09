import os
import json
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from groq import Groq
import psycopg2
from psycopg2.extras import RealDictCursor

load_dotenv()

app = FastAPI(title="Vanna AI Service")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database connection
DATABASE_URL = os.getenv("DATABASE_URL", "").replace("postgresql+psycopg://", "postgresql://")
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")

if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable is required")
if not GROQ_API_KEY:
    raise ValueError("GROQ_API_KEY environment variable is required")

# Initialize Groq client
groq_client = Groq(api_key=GROQ_API_KEY)

# Connect to database
try:
    conn = psycopg2.connect(DATABASE_URL)
    print("Connected to PostgreSQL database")
except Exception as e:
    print(f"Database connection error: {e}")
    raise

# Get database schema for context
def get_schema_info():
    """Get database schema information for SQL generation context"""
    try:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT 
                    table_name,
                    column_name,
                    data_type
                FROM information_schema.columns
                WHERE table_schema = 'public'
                ORDER BY table_name, ordinal_position
            """)
            columns = cur.fetchall()
            
            schema_info = {}
            for table, column, dtype in columns:
                if table not in schema_info:
                    schema_info[table] = []
                # Use quoted identifier for camelCase columns
                quoted_column = f'"{column}"' if column != column.lower() else column
                schema_info[table].append(f"{quoted_column} ({dtype})")
            
            return schema_info
    except Exception as e:
        print(f"Error getting schema: {e}")
        return {}

schema_info = get_schema_info()

def generate_sql_from_nl(query: str) -> str:
    """Generate SQL from natural language using Groq"""
    schema_text = "\n".join([
        f"Table {table}: {', '.join(cols)}"
        for table, cols in schema_info.items()
    ])
    
    prompt = f"""You are a SQL expert. Given the following database schema, generate a PostgreSQL query for the user's question.

IMPORTANT RULES:
1. Column names that contain uppercase letters (camelCase) MUST be quoted with double quotes. For example, use "documentId" not documentid, use "invoiceTotal" not invoicetotal.
2. Table names should be lowercase (they are: documents, invoices, vendors, customers, payments, summaries, line_items).
3. Use proper JOIN syntax to connect related tables.
4. For date intervals, use plural forms: '60 days', '3 months', '2 years' (not '60 day').

Database Schema:
{schema_text}

Key Relationships:
- documents.id connects to invoices.documentId, vendors.documentId, customers.documentId, payments.documentId, summaries.documentId
- To filter by invoice date, join: summaries -> documents -> invoices, then use invoices."invoiceDate"
- To filter by document creation date, use documents."createdAt"

User Question: {query}

Generate ONLY the SQL query, nothing else. Do not include explanations or markdown formatting. Just the SQL statement. Remember to quote ALL camelCase column names.

SQL Query:"""
    
    try:
        response = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "You are a SQL expert. Generate only valid PostgreSQL queries."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.1,
            max_tokens=500
        )
        
        sql = response.choices[0].message.content.strip()
        # Remove markdown code blocks if present
        if sql.startswith("```"):
            sql = sql.split("```")[1]
            if sql.startswith("sql"):
                sql = sql[3:]
            sql = sql.strip()
        
        # Fix camelCase column names that aren't quoted
        # Get all column names from schema
        import re
        all_columns = []
        for table, cols in schema_info.items():
            for col_info in cols:
                # Extract column name (remove quotes and type info)
                col_name = col_info.split(" (")[0].strip('"')
                if col_name != col_name.lower():  # camelCase
                    all_columns.append(col_name)
        
        # Replace unquoted camelCase column names with quoted versions
        # Pattern: column name after table alias or dot, or standalone
        for col in all_columns:
            # Match patterns like: s.documentid, documentid, or "table".documentid
            # But not already quoted like "documentId"
            patterns = [
                (r'(\w+)\.' + re.escape(col.lower()) + r'\b', r'\1."' + col + '"'),  # table.documentid -> table."documentId"
                (r'\b' + re.escape(col.lower()) + r'\b(?!")', f'"{col}"'),  # standalone documentid -> "documentId"
            ]
            for pattern, replacement in patterns:
                sql = re.sub(pattern, replacement, sql, flags=re.IGNORECASE)
        
        # Fix common SQL issues
        # Fix interval syntax: '60 day' -> '60 days'
        sql = re.sub(r"INTERVAL\s+'(\d+)\s+day'", r"INTERVAL '\1 days'", sql, flags=re.IGNORECASE)
        sql = re.sub(r"INTERVAL\s+'(\d+)\s+month'", r"INTERVAL '\1 months'", sql, flags=re.IGNORECASE)
        sql = re.sub(r"INTERVAL\s+'(\d+)\s+year'", r"INTERVAL '\1 years'", sql, flags=re.IGNORECASE)
        
        return sql
    except Exception as e:
        print(f"Error generating SQL: {e}")
        raise

def generate_response_from_sql(sql: str, question: str, data: list) -> str:
    """Generate natural language response from SQL results"""
    if not data:
        return "Query executed successfully, but no results were found."
    
    prompt = f"""The user asked: "{question}"

The SQL query executed was: {sql}

The query returned {len(data)} row(s). Here are the first few results:
{json.dumps(data[:5], indent=2)}

Generate a concise, natural language response summarizing these results. Be specific with numbers and values.

Response:"""
    
    try:
        response = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "You are a helpful data analyst. Provide clear, concise summaries of query results."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            max_tokens=200
        )
        
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"Error generating response: {e}")
        # Fallback response
        if data:
            return f"Found {len(data)} result(s) for your query."
        return "Query executed successfully."

class ChatRequest(BaseModel):
    query: str

class ChatResponse(BaseModel):
    response: str
    sql: str
    data: list = None
    error: str = None

@app.get("/")
def root():
    return {"message": "Vanna AI Service is running"}

@app.get("/health")
def health():
    return {"status": "healthy"}

@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    try:
        # Generate SQL from natural language
        sql = generate_sql_from_nl(request.query)
        
        if not sql:
            return ChatResponse(
                response="I couldn't generate a SQL query for that question. Please try rephrasing.",
                sql="",
                error="No SQL generated"
            )
        
        # Execute SQL query
        try:
            # Rollback any previous failed transaction
            conn.rollback()
            
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute(sql)
                results = cur.fetchall()
                data = [dict(row) for row in results]
                conn.commit()
        except Exception as e:
            conn.rollback()  # Rollback on error
            return ChatResponse(
                response=f"Error executing SQL query: {str(e)}",
                sql=sql,
                error=str(e)
            )
        
        # Generate natural language response
        response_text = generate_response_from_sql(sql, request.query, data)
        
        return ChatResponse(
            response=response_text,
            sql=sql,
            data=data[:100]  # Limit to 100 rows
        )
    
    except Exception as e:
        print(f"Chat error: {e}")
        return ChatResponse(
            response=f"Sorry, I encountered an error: {str(e)}",
            sql="",
            error=str(e)
        )

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run(app, host="0.0.0.0", port=port)
