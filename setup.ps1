# Analytics Dashboard Setup Script (PowerShell)

Write-Host "🚀 Setting up Analytics Dashboard..." -ForegroundColor Cyan

# Check if Node.js is installed
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Node.js is not installed. Please install Node.js 18+ first." -ForegroundColor Red
    exit 1
}

# Check if Docker is available
if (Get-Command docker -ErrorAction SilentlyContinue) {
    Write-Host "📦 Starting PostgreSQL with Docker..." -ForegroundColor Yellow
    docker-compose up -d
    Start-Sleep -Seconds 5
}

# Install root dependencies
Write-Host "📦 Installing root dependencies..." -ForegroundColor Yellow
npm install

# Setup API
Write-Host "📦 Setting up API..." -ForegroundColor Yellow
Set-Location apps/api
npm install
npx prisma generate

# Setup Web
Write-Host "📦 Setting up Web..." -ForegroundColor Yellow
Set-Location ../web
npm install

# Go back to root
Set-Location ../..

# Create .env files if they don't exist
if (-not (Test-Path "apps/api/.env")) {
    Write-Host "📝 Creating apps/api/.env..." -ForegroundColor Yellow
    Copy-Item "apps/api/.env.example" "apps/api/.env"
    Write-Host "⚠️  Please update apps/api/.env with your database URL" -ForegroundColor Yellow
}

if (-not (Test-Path "apps/web/.env.local")) {
    Write-Host "📝 Creating apps/web/.env.local..." -ForegroundColor Yellow
    @"
NEXT_PUBLIC_API_BASE=/api
NEXT_PUBLIC_APP_URL=http://localhost:3000
"@ | Out-File -FilePath "apps/web/.env.local" -Encoding utf8
}

if (-not (Test-Path "services/vanna/.env")) {
    Write-Host "📝 Creating services/vanna/.env..." -ForegroundColor Yellow
    Copy-Item "services/vanna/.env.example" "services/vanna/.env"
    Write-Host "⚠️  Please update services/vanna/.env with your database URL and Groq API key" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "✅ Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Update environment variables in apps/api/.env and services/vanna/.env"
Write-Host "2. Run database migrations: npm run db:push"
Write-Host "3. Seed the database: npm run db:seed"
Write-Host "4. Start the development servers: npm run dev"
Write-Host "5. In another terminal, start Vanna AI: cd services/vanna && python app.py"

