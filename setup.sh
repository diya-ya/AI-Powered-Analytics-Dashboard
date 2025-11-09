#!/bin/bash

# Analytics Dashboard Setup Script

echo "🚀 Setting up Analytics Dashboard..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if PostgreSQL is running (optional, for Docker)
if command -v docker &> /dev/null; then
    echo "📦 Starting PostgreSQL with Docker..."
    docker-compose up -d
    sleep 5
fi

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Setup API
echo "📦 Setting up API..."
cd apps/api
npm install
npx prisma generate

# Setup Web
echo "📦 Setting up Web..."
cd ../web
npm install

# Go back to root
cd ../..

# Create .env files if they don't exist
if [ ! -f "apps/api/.env" ]; then
    echo "📝 Creating apps/api/.env..."
    cp apps/api/.env.example apps/api/.env
    echo "⚠️  Please update apps/api/.env with your database URL"
fi

if [ ! -f "apps/web/.env.local" ]; then
    echo "📝 Creating apps/web/.env.local..."
    echo "NEXT_PUBLIC_API_BASE=/api" > apps/web/.env.local
    echo "NEXT_PUBLIC_APP_URL=http://localhost:3000" >> apps/web/.env.local
fi

if [ ! -f "services/vanna/.env" ]; then
    echo "📝 Creating services/vanna/.env..."
    cp services/vanna/.env.example services/vanna/.env
    echo "⚠️  Please update services/vanna/.env with your database URL and Groq API key"
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update environment variables in apps/api/.env and services/vanna/.env"
echo "2. Run database migrations: npm run db:push"
echo "3. Seed the database: npm run db:seed"
echo "4. Start the development servers: npm run dev"
echo "5. In another terminal, start Vanna AI: cd services/vanna && python app.py"

