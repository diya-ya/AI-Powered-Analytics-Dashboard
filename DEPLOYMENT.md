# Deployment Guide

This guide covers deploying the Analytics Dashboard application to production.

## Architecture Overview

- **Frontend + Backend**: Next.js application deployed on Vercel
- **Vanna AI Service**: Python FastAPI service (deploy to Render/Railway/Fly.io)
- **Database**: PostgreSQL (managed service like Supabase, Neon, or Railway)

## Prerequisites

1. GitHub account
2. Vercel account
3. Render/Railway/Fly.io account (for Vanna AI)
4. PostgreSQL database (managed service)
5. Groq API key

## Step 1: Set Up PostgreSQL Database

### Option A: Managed Service (Recommended)

1. **Supabase** (Free tier available):
   - Go to https://supabase.com
   - Create a new project
   - Copy the connection string

2. **Neon** (Free tier available):
   - Go to https://neon.tech
   - Create a new project
   - Copy the connection string

3. **Railway**:
   - Go to https://railway.app
   - Create a new PostgreSQL service
   - Copy the connection string

### Option B: Docker (Local Development)

```bash
docker-compose up -d
```

## Step 2: Deploy Frontend + Backend to Vercel

1. **Push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. **Connect to Vercel**:
   - Go to https://vercel.com
   - Import your GitHub repository
   - Select the root directory
   - Configure build settings:
     - **Framework Preset**: Next.js
     - **Root Directory**: `apps/web` (for frontend) or create separate projects
     - **Build Command**: `cd ../.. && npm install && npm run build`
     - **Output Directory**: `.next`

3. **Set Environment Variables in Vercel**:
   ```
   DATABASE_URL=postgresql://user:pass@host:5432/dbname
   VANNA_API_BASE_URL=https://your-vanna-service.onrender.com
   VANNA_API_KEY=
   NEXT_PUBLIC_API_BASE=/api
   NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
   ```

4. **Deploy**:
   - Vercel will automatically deploy on push
   - Or trigger manually from the dashboard

## Step 3: Deploy Vanna AI Service

### Option A: Render

1. **Create New Web Service**:
   - Go to https://render.com
   - Click "New" → "Web Service"
   - Connect your GitHub repository

2. **Configure Service**:
   - **Name**: `vanna-ai-service`
   - **Root Directory**: `services/vanna`
   - **Environment**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `python app.py`

3. **Set Environment Variables**:
   ```
   DATABASE_URL=postgresql+psycopg://user:pass@host:5432/dbname
   GROQ_API_KEY=your_groq_api_key
   PORT=8000
   ```

4. **Deploy**:
   - Render will build and deploy automatically

### Option B: Railway

1. **Create New Project**:
   - Go to https://railway.app
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your repository

2. **Configure Service**:
   - Select `services/vanna` directory
   - Railway will auto-detect Python

3. **Set Environment Variables**:
   - Same as Render above

4. **Deploy**:
   - Railway will deploy automatically

### Option C: Fly.io

1. **Install Fly CLI**:
   ```bash
   curl -L https://fly.io/install.sh | sh
   ```

2. **Create Fly App**:
   ```bash
   cd services/vanna
   fly launch
   ```

3. **Set Secrets**:
   ```bash
   fly secrets set DATABASE_URL=postgresql+psycopg://...
   fly secrets set GROQ_API_KEY=...
   ```

4. **Deploy**:
   ```bash
   fly deploy
   ```

## Step 4: Seed the Database

1. **Local Setup**:
   ```bash
   cd apps/api
   npm install
   npx prisma generate
   npx prisma db push
   npm run db:seed
   ```

2. **Production Setup**:
   - Use a database migration tool or run the seed script manually
   - Or use Prisma Studio: `npx prisma studio`

## Step 5: Update CORS Settings

Ensure your Vanna AI service allows requests from your Vercel domain:

```python
# In services/vanna/app.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://your-app.vercel.app",
        "http://localhost:3000",  # For local development
    ],
    ...
)
```

## Step 6: Verify Deployment

1. **Frontend**: Visit `https://your-app.vercel.app`
2. **Backend API**: Test `https://your-app.vercel.app/api/stats`
3. **Vanna AI**: Test `https://your-vanna-service.onrender.com/health`

## Troubleshooting

### Database Connection Issues
- Verify `DATABASE_URL` format
- Check if database allows external connections
- Verify firewall rules

### Vanna AI Not Responding
- Check logs in Render/Railway dashboard
- Verify `GROQ_API_KEY` is set correctly
- Check database connection

### CORS Errors
- Update `allow_origins` in Vanna AI service
- Verify frontend URL matches exactly

## Environment Variables Summary

### Frontend (Vercel)
```
NEXT_PUBLIC_API_BASE=/api
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

### Backend (Vercel - same project)
```
DATABASE_URL=postgresql://user:pass@host:5432/dbname
VANNA_API_BASE_URL=https://your-vanna-service.onrender.com
VANNA_API_KEY=
```

### Vanna AI (Render/Railway/Fly.io)
```
DATABASE_URL=postgresql+psycopg://user:pass@host:5432/dbname
GROQ_API_KEY=your_groq_api_key
PORT=8000
```

## Monitoring

- **Vercel**: Check deployment logs and analytics
- **Render/Railway**: Monitor service logs and metrics
- **Database**: Use database provider's monitoring tools

## Scaling

- **Database**: Upgrade to higher tier as needed
- **Vanna AI**: Render/Railway auto-scales based on traffic
- **Frontend**: Vercel handles scaling automatically

