# Analytics Dashboard - Full Stack Application

A production-grade full-stack web application with an interactive analytics dashboard and "Chat with Data" interface powered by Vanna AI.

## 🏗️ Architecture

This is a monorepo built with Turborepo containing:

- **apps/web**: Next.js frontend with shadcn/ui
- **apps/api**: Next.js API routes with Prisma ORM
- **services/vanna**: Python FastAPI service with Vanna AI and Groq

## 📋 Prerequisites

- Node.js 18+
- Python 3.10+
- PostgreSQL 14+
- pnpm or npm

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
# or
pnpm install
```

### 2. Set Up Database

Create a PostgreSQL database and update the connection string in `apps/api/.env`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/analytics_db"
```

### 3. Run Database Migrations

```bash
npm run db:generate
npm run db:push
```

### 4. Seed Database

```bash
npm run db:seed
```

### 5. Set Up Environment Variables

#### Frontend (`apps/web/.env.local`)
```env
NEXT_PUBLIC_API_BASE=/api
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

#### Backend (`apps/api/.env`)
```env
DATABASE_URL=postgresql://user:password@localhost:5432/analytics_db
VANNA_API_BASE_URL=http://localhost:8000
VANNA_API_KEY=
```

#### Vanna AI (`services/vanna/.env`)
```env
DATABASE_URL=postgresql+psycopg://user:password@localhost:5432/analytics_db
GROQ_API_KEY=your_groq_api_key
PORT=8000
```

### 6. Start Development Servers

#### Terminal 1: Frontend + Backend
```bash
npm run dev
```

#### Terminal 2: Vanna AI Service
```bash
cd services/vanna
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

## 📁 Project Structure

```
.
├── apps/
│   ├── web/              # Next.js frontend
│   │   ├── app/          # App router pages
│   │   ├── components/   # React components
│   │   └── lib/          # Utilities
│   └── api/              # Next.js API routes
│       ├── app/api/      # API endpoints
│       ├── prisma/       # Database schema
│       └── scripts/      # Data ingestion
├── services/
│   └── vanna/            # Python FastAPI service
│       ├── app.py        # FastAPI app
│       └── requirements.txt
└── data/
    └── Analytics_Test_Data.json
```

## 🗄️ Database Schema

The database is normalized into the following tables:

- **documents**: File metadata and status
- **invoices**: Invoice information (id, date, delivery date)
- **vendors**: Vendor details (name, address, tax ID)
- **customers**: Customer information
- **payments**: Payment terms and bank details
- **line_items**: Invoice line items
- **categories**: Spending categories (derived from line items)

See `apps/api/prisma/schema.prisma` for the complete schema.

## 🔌 API Endpoints

### Analytics Endpoints

- `GET /api/stats` - Overview card metrics
- `GET /api/invoice-trends` - Monthly invoice trends
- `GET /api/vendors/top10` - Top 10 vendors by spend
- `GET /api/category-spend` - Spending by category
- `GET /api/cash-outflow` - Cash outflow forecast
- `GET /api/invoices` - Invoice list with filters

### AI Endpoints

- `POST /api/chat-with-data` - Natural language query to SQL

## 🤖 Vanna AI Setup

The Vanna AI service connects to PostgreSQL and uses Groq for SQL generation.

1. Get a Groq API key from https://console.groq.com
2. Set `GROQ_API_KEY` in `services/vanna/.env`
3. The service will automatically train on your database schema

## 🚢 Deployment

### Frontend + Backend (Vercel)

1. Connect your GitHub repo to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy

### Vanna AI (Render/Railway/Fly.io)

1. Create a new service
2. Set environment variables
3. Deploy from `services/vanna` directory

### Database

Use a managed PostgreSQL service (Supabase, Neon, Railway, etc.) and update `DATABASE_URL` in all services.

## 📊 Features

- **Interactive Dashboard**: Real-time analytics with charts and metrics
- **Chat with Data**: Natural language queries converted to SQL
- **Responsive Design**: Mobile-friendly UI
- **Type Safety**: Full TypeScript coverage

## 📝 License

MIT

