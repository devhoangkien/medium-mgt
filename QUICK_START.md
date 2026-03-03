# 🚀 Quick Start - Medium Bot Manager

## 1️⃣ Push Code Lên GitHub (NGAY BÂY GIỜ)

### Option A: SSH (Recommended)

**Bước 1:** Copy SSH key
```bash
cat ~/.ssh/id_ed25519_medium_bot.pub
```

**Bước 2:** Add vào GitHub
- Vào: https://github.com/settings/keys
- Click "New SSH key"
- Paste key vào
- Save

**Bước 3:** Push
```bash
cd /home/ubuntu/.openclaw/workspace/medium-bot-manager
git push -u origin main
```

### Option B: HTTPS với Token

**Bước 1:** Tạo token
- Vào: https://github.com/settings/tokens
- Generate new token (classic)
- Scope: tick `repo`
- Copy token

**Bước 2:** Push với token
```bash
cd /home/ubuntu/.openclaw/workspace/medium-bot-manager
git remote set-url origin https://github.com/devhoangkien/medium-mgt.git
git push -u origin main
```
- Username: `devhoangkien`
- Password: Paste token

---

## 2️⃣ Setup Local Development

### Cài đặt dependencies
```bash
cd /home/ubuntu/.openclaw/workspace/medium-bot-manager
npm install
```

### Setup database (chọn 1)

**Dùng Docker (Dễ nhất):**
```bash
docker-compose up -d db redis
npm run db:push
```

**Hoặc cài PostgreSQL trực tiếp:**
```bash
# Ubuntu
sudo apt install postgresql
sudo -u postgres createdb medium_bot_manager

# macOS
brew install postgresql
brew services start postgresql
createdb medium_bot_manager
```

### Chạy dev server
```bash
npm run dev
```

Truy cập: http://localhost:3000

---

## 3️⃣ Test API

### Register tài khoản đầu tiên
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Austin"
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

### Check health
```bash
curl http://localhost:3000/api/health
```

---

## 4️⃣ Production Deploy

### Docker Compose (Recommended)

```bash
# Copy production env
cp .env.production .env

# Edit .env với JWT_SECRET mới
# openssl rand -hex 32

# Build & run
docker-compose up -d --build

# Check logs
docker-compose logs -f app
```

Truy cập: http://localhost:3000

### Manual Deploy

```bash
npm install
npm run build
npm run preview
```

---

## 📁 Files Quan Trọng

| File | Mục đích |
|------|----------|
| `.env` | Environment variables (local) |
| `prisma/schema.prisma` | Database schema |
| `server/api/` | Backend API endpoints |
| `pages/` | Frontend pages |
| `server/services/medium-bot.ts` | Bot logic |
| `docker-compose.yml` | Production deploy |

---

## 🆘 Troubleshooting

### Lỗi: Database connection failed
```bash
# Check PostgreSQL running
sudo systemctl status postgresql

# Restart
sudo systemctl restart postgresql
```

### Lỗi: Port 3000 already in use
```bash
# Change port in .env
NUXT_PORT=3001
```

### Lỗi: Prisma not generated
```bash
npm run db:generate
```

### Lỗi: Playwright browsers missing
```bash
npx playwright install chromium
```

---

## ✅ Checklist Sau Khi Push

- [ ] Code trên GitHub
- [ ] Clone về máy local
- [ ] Install dependencies
- [ ] Setup database
- [ ] Chạy dev server
- [ ] Test register/login
- [ ] Add Medium account
- [ ] Test publish bài viết

---

## 📞 Need Help?

- Check: SETUP.md for detailed setup
- Check: PROJECT_STATUS.md for current status
- Check: PUSH_INSTRUCTIONS.md for GitHub push help

---

**Let's go! 🚀**
