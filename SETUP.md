# 🛠️ Setup Guide - Medium Bot Manager

## Yêu Cầu Hệ Thống

- Node.js 18+ 
- PostgreSQL 14+
- Redis 6+ (cho scheduling)
- npm hoặc yarn

---

## 📦 Cài Đặt Nhanh

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Environment Variables

```bash
cp .env.example .env
```

Edit `.env` với thông tin của bạn:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/medium_bot_manager?schema=public"

# Redis
REDIS_URL="redis://localhost:6379"

# JWT Secret (tạo mới với: openssl rand -hex 32)
JWT_SECRET="your-super-secret-key-here"

# Bot Settings
BOT_HEADLESS="true"
```

### 3. Setup Database

```bash
# Generate Prisma Client
npm run db:generate

# Push schema to database (development)
npm run db:push

# HOẶC chạy migrations (production)
npm run db:migrate
```

### 4. Install Playwright Browsers

```bash
npx playwright install chromium
```

### 5. Run Development Server

```bash
npm run dev
```

Truy cập: http://localhost:3000

---

## 🐘 Setup PostgreSQL

### macOS

```bash
brew install postgresql
brew services start postgresql
createdb medium_bot_manager
```

### Ubuntu/Debian

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo -u postgres createdb medium_bot_manager
```

### Docker

```bash
docker run -d \
  --name postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=medium_bot_manager \
  -p 5432:5432 \
  postgres:15-alpine
```

---

## 🔴 Setup Redis

### macOS

```bash
brew install redis
brew services start redis
```

### Ubuntu/Debian

```bash
sudo apt install redis-server
sudo systemctl start redis
```

### Docker

```bash
docker run -d \
  --name redis \
  -p 6379:6379 \
  redis:7-alpine
```

---

## 🔐 Tạo JWT Secret

```bash
openssl rand -hex 32
```

Copy output vào `.env`:

```env
JWT_SECRET="output-tren-day"
```

---

## 🧪 Test API

### Health Check

```bash
curl http://localhost:3000/api/health
```

### Register User

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }'
```

### Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Get User Info (với token)

```bash
curl http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 🚀 Production Build

```bash
# Build
npm run build

# Preview
npm run preview

# Start (với PM2)
pm2 start npm --name "medium-bot" -- start
```

---

## 🐳 Docker Deployment

Tạo `docker-compose.yml`:

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/medium_bot_manager
      - REDIS_URL=redis://redis:6379
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - db
      - redis

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_PASSWORD=postgres
      - POSTGRES_DB=medium_bot_manager
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

Run:

```bash
docker-compose up -d
```

---

## 🧰 Troubleshooting

### Lỗi: Cannot connect to database

```bash
# Check PostgreSQL đang chạy
sudo systemctl status postgresql

# Restart PostgreSQL
sudo systemctl restart postgresql
```

### Lỗi: Prisma Client not generated

```bash
npm run db:generate
```

### Lỗi: Playwright browsers not found

```bash
npx playwright install chromium
```

### Lỗi: Port 3000 already in use

```bash
# Change port in .env
NUXT_PORT=3001
```

---

## 📞 Cần Trợ Giúp?

- Check logs: `npm run dev` sẽ hiển thị errors
- Database issues: `npx prisma studio` để xem data
- API issues: Test với curl hoặc Postman

---

**Enjoy building! 🚀**
