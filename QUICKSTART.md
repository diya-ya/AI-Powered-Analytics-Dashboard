# Quick Start Guide

Get the Analytics Dashboard up and running in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- PostgreSQL database (local or cloud)
- Python 3.10+ installed (for Vanna AI)
- Groq API key ([Get one here](https://console.groq.com))

## Step 1: Clone and Install

```bash
# Install dependencies
npm install

# Or use the setup script
# Windows:
.\setup.ps1
# Linux/Mac:
chmod +x setup.sh && ./setup.sh
```

## Step 2: Set Up Database

### Option A: Docker (Easiest)
```bash
docker-compose up -d
```

### Option B: Existing PostgreSQL
Create a database named `analytics_db` (or any name you prefer)

## Step 3: Configure Environment

### Backend (`apps/api/.env`)
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/analytics_db"
VANNA_API_BASE_URL="http://localhost:8000"
VANNA_API_KEY=""
```

### Frontend (`apps/web/.env.local`)
```env
NEXT_PUBLIC_API_BASE=/api
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Vanna AI (`services/vanna/.env`)
```env
DATABASE_URL=postgresql+psycopg://postgres:postgres@localhost:5432/analytics_db
GROQ_API_KEY=your_groq_api_key_here
PORT=8000
```

## Step 4: Initialize Database

```bash
# Generate Prisma client
cd apps/api
npx prisma generate
npx prisma db push

# Seed the database
npm run db:seed
```

## Step 5: Start Services

### Terminal 1: Frontend + Backend
```bash
# From project root
npm run dev
```

This starts:
- Frontend on http://localhost:3000
- Backend API on http://localhost:3001

### Terminal 2: Vanna AI Service
```bash
cd services/vanna

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (Linux/Mac)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start service
python app.py
```

Service runs on http://localhost:8000

## Step 6: Access the Application

1. Open http://localhost:3000 in your browser
2. You should see the dashboard with:
   - Overview cards showing metrics
   - Charts displaying data
   - Invoices table

3. Navigate to "Chat with Data" in the sidebar
4. Try asking:
   - "What's the total spend in the last 90 days?"
   - "List top 5 vendors by spend"
   - "Show overdue invoices"

## Troubleshooting

### Database Connection Error
- Verify PostgreSQL is running
- Check `DATABASE_URL` format
- Ensure database exists

### Vanna AI Not Responding
- Check if service is running on port 8000
- Verify `GROQ_API_KEY` is set correctly
- Check service logs for errors

### Frontend Not Loading Data
- Verify backend is running on port 3001
- Check browser console for errors
- Verify API endpoints are accessible

### Port Already in Use
- Change ports in:
  - `apps/web/package.json` (dev script)
  - `apps/api/package.json` (dev script)
  - `services/vanna/.env` (PORT)

## Next Steps

- Read `README.md` for full documentation
- Check `API_DOCUMENTATION.md` for API details
- See `DEPLOYMENT.md` for production deployment
- Review `CHAT_WITH_DATA.md` for AI feature details

## Need Help?

- Check the documentation files
- Review error logs in terminal
- Verify all environment variables are set
- Ensure all services are running

Happy coding! 🚀

