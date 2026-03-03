# Medium Bot Manager 📝

Tự động hóa đăng bài lên nhiều Medium accounts cùng lúc.

## Features

- ✅ Quản lý nhiều Medium accounts
- ✅ Tạo & chỉnh sửa articles (Markdown support)
- ✅ Tự động đăng bài với scheduling
- ✅ Publish lên nhiều accounts cùng lúc
- ✅ Theo dõi publish history & status
- ✅ Rate limiting để tránh bị ban
- ✅ Cookie encryption cho security

## Tech Stack

- **Frontend:** Nuxt 4 + Vue 3 + TailwindCSS
- **Backend:** Nuxt Server Routes (Nitro)
- **Database:** PostgreSQL + Prisma ORM
- **Queue:** Redis + BullMQ
- **Bot:** Playwright (Chromium)

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Environment

```bash
cp .env.example .env
# Edit .env with your database credentials
```

### 3. Setup Database

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Or run migrations
npm run db:migrate
```

### 4. Run Development Server

```bash
npm run dev
```

Open http://localhost:3000

## Project Structure

```
medium-bot-manager/
├── prisma/
│   └── schema.prisma       # Database schema
├── server/
│   ├── api/                # API endpoints
│   ├── services/           # Business logic
│   └── utils/              # Utilities
├── pages/                  # Nuxt pages
├── components/             # Vue components
├── layouts/                # Layout templates
└── composables/            # Vue composables
```

## API Endpoints

### Accounts
- `GET /api/accounts` - List all accounts
- `POST /api/accounts` - Add new account
- `DELETE /api/accounts/:id` - Remove account
- `POST /api/accounts/:id/verify` - Verify session

### Articles
- `GET /api/articles` - List articles
- `POST /api/articles` - Create article
- `PUT /api/articles/:id` - Update article
- `DELETE /api/articles/:id` - Delete article
- `POST /api/articles/:id/publish` - Publish article

## Security

- Cookies được mã hóa AES-256
- JWT authentication cho API
- Rate limiting (3-5 posts/account/ngày)
- Session auto-verification

## Development

```bash
# Run dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Open Prisma Studio
npm run db:studio
```

## Deployment

### Docker

```bash
docker-compose up -d
```

### Manual

```bash
npm run build
npm run preview
```

## License

Private - All rights reserved

---

Built with ❤️ by Austin
