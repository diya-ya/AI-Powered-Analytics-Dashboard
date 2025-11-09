# Vanna AI Service

Python FastAPI service that provides natural language to SQL conversion using Vanna AI and Groq.

## Setup

1. Install dependencies:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

2. Set environment variables:
```bash
cp .env.example .env
# Edit .env with your database URL and Groq API key
```

3. Get a Groq API key:
   - Visit https://console.groq.com
   - Sign up and create an API key

4. Run the service:
```bash
python app.py
```

The service will be available at http://localhost:8000

## API Endpoints

- `GET /` - Health check
- `GET /health` - Health status
- `POST /api/chat` - Process natural language query

### Chat Request
```json
{
  "query": "What's the total spend in the last 90 days?"
}
```

### Chat Response
```json
{
  "response": "The total spend in the last 90 days is €12,679.25",
  "sql": "SELECT SUM(invoice_total) FROM summaries WHERE ...",
  "data": [...]
}
```

