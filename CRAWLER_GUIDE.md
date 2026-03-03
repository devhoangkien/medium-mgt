# 🕷️ Web Crawler Guide

Crawl articles từ websites (juejin.cn, v.v.) và rewrite với OpenClaw.

---

## 🎯 Use Cases

1. **Crawl bài viết từ Juejin.cn** - Lấy nội dung tech articles
2. **Rewrite với OpenClaw** - Tạo unique content tránh plagiarism
3. **Auto-publish lên Medium** - Đăng bài đã rewrite
4. **Multi-language support** - Convert giữa Chinese/English/Vietnamese

---

## 🚀 Quick Start

### 1. Truy cập Crawl Page

```
https://fitted-motor-pre-newfoundland.trycloudflare.com/crawl
```

### 2. Quick Crawl (Single URL)

1. Paste URL bài viết (ví dụ: `https://juejin.cn/post/123456`)
2. Chọn rewrite style (Blog/Tutorial/News/Opinion)
3. Chọn language (Chinese/English/Vietnamese)
4. Tick "Rewrite với OpenClaw"
5. Click "🚀 Crawl Ngay"

### 3. Add Crawl Source (Saved)

1. Nhập name (ví dụ: "Juejin Daily")
2. Nhập base URL (ví dụ: `https://juejin.cn/`)
3. CSS Selector (optional, để auto-detect)
4. Click "➕ Add Source"
5. Click ▶️ để crawl source bất cứ lúc nào

---

## 📋 API Endpoints

### POST /api/crawl-sources
**Add crawl source**

```bash
curl -X POST https://YOUR_URL/api/crawl-sources \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Juejin Tech",
    "url": "https://juejin.cn/",
    "selector": ".article-content"
  }'
```

### GET /api/crawl-sources
**List sources**

```bash
curl https://YOUR_URL/api/crawl-sources
```

### POST /api/crawl
**Start crawl job**

```bash
curl -X POST https://YOUR_URL/api/crawl \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://juejin.cn/post/7318629389897",
    "rewrite": true,
    "rewriteStyle": "blog",
    "rewriteLanguage": "en"
  }'
```

Response:
```json
{
  "success": true,
  "data": {
    "jobId": "clx123abc",
    "status": "RUNNING",
    "message": "Crawl job started..."
  }
}
```

### GET /api/crawl/:id
**Get job status**

```bash
curl https://YOUR_URL/api/crawl/clx123abc
```

### GET /api/crawl-jobs
**List all jobs**

```bash
curl https://YOUR_URL/api/crawl-jobs
```

---

## 🔧 Crawler Config

### Supported Selectors

Crawler tự động detect content với các selectors phổ biến:

```javascript
// Auto-detected selectors
- article
- .article-content
- .content
- main
- [class*="content"]

// Custom selector (nếu auto-detect fails)
.article-body
.post-content
#main-content
```

### Crawl Config Options

```typescript
interface CrawlConfig {
  selector?: string        // CSS selector
  waitForSelector?: string // Wait for element
  delay?: number           // Delay before extract (ms)
  timeout?: number         // Max wait time (ms)
  headers?: object         // Custom headers
}
```

---

## ✨ OpenClaw Rewrite

### Rewrite Styles

| Style | Description |
|-------|-------------|
| `blog` | Blog post format, casual tone |
| `tutorial` | Step-by-step guide |
| `news` | News article style |
| `opinion` | Opinion/analysis piece |

### Languages

- `zh` - Chinese (中文)
- `en` - English
- `vi` - Vietnamese (Tiếng Việt)

### Example Prompt

OpenClaw nhận prompt:
```
Bạn là professional content writer. Hãy rewrite article sau:

**Original Title:** Vue 3 Composition API Guide
**Source:** https://juejin.cn/post/123456

**Yêu cầu:**
- Style: tutorial
- Tone: professional
- Language: English
- Length: same

**Nội dung gốc:**
[content...]

Trả về JSON:
{
  "title": "...",
  "content": "...",
  "summary": "...",
  "tags": ["..."]
}
```

---

## 📊 Job Status

| Status | Description |
|--------|-------------|
| `PENDING` | Waiting to start |
| `RUNNING` | Currently crawling/rewriting |
| `COMPLETED` | Done (check rewrittenContent) |
| `FAILED` | Error (check error field) |

---

## 🎯 Example: Crawl Juejin.cn

### Step 1: Get Article URL

1. Go to juejin.cn
2. Find article you want
3. Copy URL (e.g., `https://juejin.cn/post/7318629389897208`)

### Step 2: Start Crawl

```bash
curl -X POST https://YOUR_URL/api/crawl \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "url": "https://juejin.cn/post/7318629389897208",
    "rewrite": true,
    "rewriteStyle": "tutorial",
    "rewriteLanguage": "en"
  }'
```

### Step 3: Check Status

```bash
curl https://YOUR_URL/api/crawl/JOB_ID
```

### Step 4: Get Rewritten Content

When status = `COMPLETED`:
```json
{
  "status": "COMPLETED",
  "rawContent": "...",
  "rewrittenContent": "...",
  "openclawResponse": {
    "title": "Complete Guide to Vue 3 Composition API",
    "summary": "A comprehensive tutorial covering...",
    "tags": ["vue", "javascript", "frontend"]
  }
}
```

### Step 5: Create Article

```bash
curl -X POST https://YOUR_URL/api/articles \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "Complete Guide to Vue 3 Composition API",
    "content": "[rewritten content...]",
    "tags": ["vue", "javascript", "frontend"]
  }'
```

---

## ⚠️ Best Practices

### 1. Rate Limiting
- Don't crawl more than 10 pages/minute
- Add delays between crawls
- Respect robots.txt

### 2. Content Quality
- Always review rewritten content
- Add your own insights
- Fact-check information

### 3. Legal Considerations
- Check website's Terms of Service
- Don't crawl copyrighted content without permission
- Add attribution when required

### 4. Plagiarism Prevention
- Always use OpenClaw rewrite
- Modify structure and examples
- Add original analysis

---

## 🐛 Troubleshooting

### Crawl fails with timeout
```
Solution: Increase timeout in config
{ "timeout": 60000 }
```

### Content is empty
```
Solution: Try custom selector
{ "selector": ".main-article-body" }
```

### Rewrite fails
```
Solution: Check OpenClaw integration
- Verify OpenClaw is running
- Check API credentials
- Try shorter content (< 8000 chars)
```

### Job stuck in RUNNING
```
Solution: Check server logs
- Crawler may be waiting for page load
- Increase delay: { "delay": 5000 }
```

---

## 📈 Future Enhancements

- [ ] Scheduled crawling (cron jobs)
- [ ] Batch crawl multiple URLs
- [ ] Content similarity check
- [ ] Auto-tagging with AI
- [ ] Image download & optimization
- [ ] PDF export
- [ ] RSS feed support

---

## 📞 Need Help?

Check logs:
```bash
# Server logs
docker-compose logs -f app

# Crawler specific
tail -f /tmp/cloudflared.log
```

---

**Happy Crawling! 🕷️✨**
