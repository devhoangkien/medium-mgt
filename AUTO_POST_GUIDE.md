# 📤 Auto-Post to Medium Guide

Tự động điền và publish bài viết lên Medium sau khi crawl và rewrite.

---

## 🎯 Workflow

```
1. Crawl bài viết từ URL (juejin.cn, etc.)
   ↓
2. OpenClaw rewrite content (anti-plagiarism)
   ↓
3. Auto-fill medium.com/new-story form
   ↓
4. Auto-publish hoặc save as draft
   ↓
5. Get post URL & screenshot
```

---

## ⚡ Quick Start

### 1. Truy cập Crawl Page

```
https://YOUR_URL/crawl
```

### 2. Enable Auto-Post

1. Paste URL bài viết cần crawl
2. Tick ✅ **Rewrite với OpenClaw**
3. Tick ✅ **📤 Auto-post lên Medium**
4. Chọn Medium Account từ dropdown
5. Click **🚀 Crawl + Auto-Post**

### 3. Check Progress

Job sẽ chạy qua các steps:
- 🕷️ Crawling...
- ✨ Rewriting...
- 💾 Saving...
- 📤 Auto-posting...
- ✅ Completed!

---

## 🔧 API Usage

### POST /api/crawl-auto

**Full auto-post flow**

```bash
curl -X POST https://YOUR_URL/api/crawl-auto \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "url": "https://juejin.cn/post/123456",
    "rewrite": true,
    "rewriteStyle": "blog",
    "rewriteLanguage": "en",
    "autoPost": true,
    "mediumAccountId": "clx123abc"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "jobId": "clx789def",
    "status": "RUNNING",
    "message": "Crawling → Rewriting → Auto-posting to Medium..."
  }
}
```

### GET /api/crawl/:id

Check status:

```bash
curl https://YOUR_URL/api/crawl/clx789def
```

**Completed Response:**
```json
{
  "status": "COMPLETED",
  "rawContent": "...",
  "rewrittenContent": "...",
  "openclawResponse": {
    "title": "Rewritten Title",
    "summary": "...",
    "tags": ["tag1", "tag2"]
  },
  "article": {
    "id": "article_123",
    "status": "PUBLISHED",
    "mediumUrl": "https://medium.com/@user/p-abc123"
  }
}
```

---

## 🤖 How Auto-Post Works

### Step 1: Initialize Browser

```typescript
const poster = getMediumAutoPoster()
await poster.init(mediumAccount.cookies)
```

### Step 2: Navigate to Editor

```typescript
await page.goto('https://medium.com/new-story', {
  waitUntil: 'networkidle'
})
await page.waitForSelector('[data-testid="story-title"]')
```

### Step 3: Fill Title

```typescript
await page.click('[data-testid="story-title"]', { clickCount: 3 })
await page.fill('[data-testid="story-title']", data.title)
```

### Step 4: Fill Subtitle

```typescript
await page.click('[data-testid="story-subtitle"]', { clickCount: 3 })
await page.fill('[data-testid="story-subtitle"]', data.subtitle)
```

### Step 5: Fill Content

```typescript
// Click into editor
await page.click('p')

// Type paragraph by paragraph
const paragraphs = content.split('\n\n')
for (const p of paragraphs) {
  await page.keyboard.type(p.trim(), { delay: 10 })
  await page.keyboard.press('Enter')
  await page.keyboard.press('Enter')
}
```

### Step 6: Add Tags

```typescript
await page.click('[aria-label="Add tags"]')
for (const tag of tags) {
  await page.keyboard.type(tag, { delay: 20 })
  await page.keyboard.press('Enter')
}
await page.keyboard.press('Escape')
```

### Step 7: Publish

```typescript
const publishBtn = await page.$('button:has-text("Publish")')
await publishBtn.click()

const confirmBtn = await page.$('button:has-text("Publish now")')
await confirmBtn.click()
```

### Step 8: Capture Result

```typescript
const screenshot = await page.screenshot({ fullPage: true })
const postUrl = page.url()
const postId = postUrl.split('/').pop()
```

---

## 📊 Medium Account Setup

### 1. Login to Medium

- Go to medium.com
- Login with your account

### 2. Get Cookies

**Option A: From Browser DevTools**

1. Open DevTools (F12)
2. Application → Cookies → https://medium.com
3. Copy all cookies as JSON
4. Save to database

**Option B: From Existing Account**

If you already have Medium account in system:
```bash
curl https://YOUR_URL/api/accounts
```

### 3. Required Cookies

```json
[
  {
    "name": "sid",
    "value": "YOUR_SESSION_ID",
    "domain": ".medium.com",
    "path": "/",
    "secure": true,
    "httpOnly": true
  },
  {
    "name": "uid",
    "value": "YOUR_USER_ID",
    "domain": ".medium.com",
    "path": "/",
    "secure": true
  }
]
```

---

## ⚠️ Important Warnings

### 1. Medium Terms of Service

⚠️ **Auto-posting may violate Medium's TOS**

- Use for testing only
- Don't spam
- Add rate limiting (3-5 posts/day/account)
- Manual review recommended

### 2. Rate Limiting

```typescript
// Recommended limits
const MAX_POSTS_PER_DAY = 3
const DELAY_BETWEEN_POSTS = 30 * 60 * 1000 // 30 minutes
```

### 3. Account Safety

- Use dedicated test accounts
- Don't auto-post copyrighted content
- Always review before publishing
- Monitor for bans/restrictions

---

## 🎯 Best Practices

### 1. Content Quality

✅ Do:
- Always rewrite with OpenClaw
- Add original insights
- Fact-check information
- Use proper formatting

❌ Don't:
- Copy-paste original content
- Auto-post without review
- Spam low-quality content

### 2. Testing Workflow

```
1. Crawl → Rewrite → Save as Draft ✅
2. Review draft manually ✅
3. If OK → Enable Auto-Post ⚠️
4. Monitor results 📊
```

### 3. Error Handling

Auto-post can fail due to:
- Session expired
- Medium UI changes
- Network issues
- Rate limiting

Always check:
- Job status
- Error messages
- Screenshots

---

## 🐛 Troubleshooting

### Auto-post fails with "Session expired"

```
Solution:
1. Re-login to Medium
2. Get fresh cookies
3. Update account in database
```

### Content not filling properly

```
Solution:
1. Check content length (limit to 20 paragraphs)
2. Remove special characters
3. Try different selector
```

### Tags not adding

```
Solution:
1. Check Medium UI updated
2. Update selector: [aria-label="Add tags"]
3. Add tags manually after auto-fill
```

### Publish button not clicking

```
Solution:
1. Check all required fields filled
2. Wait longer for JS to initialize
3. Take screenshot to debug
```

---

## 📈 Monitoring

### Check Job Status

```bash
# List all jobs
curl https://YOUR_URL/api/crawl-jobs

# Get specific job
curl https://YOUR_URL/api/crawl/JOB_ID
```

### Check Articles

```bash
# List articles
curl https://YOUR_URL/api/articles

# Filter by status
curl https://YOUR_URL/api/articles?status=PUBLISHED
```

### Check Post Logs

```bash
# Via database
psql -d medium_bot_manager -c "SELECT * FROM post_logs ORDER BY posted_at DESC LIMIT 10"
```

---

## 🔐 Security

### Cookie Storage

```typescript
// Encrypt cookies before storing
import { AES, enc } from 'crypto-js'

const encrypted = AES.encrypt(
  JSON.stringify(cookies),
  process.env.COOKIE_SECRET!
).toString()

// Decrypt when needed
const decrypted = AES.decrypt(
  encrypted,
  process.env.COOKIE_SECRET!
).toString(enc.Utf8)
```

### Environment Variables

```env
COOKIE_SECRET=your-32-char-secret-key
MEDIUM_RATE_LIMIT=3
MEDIUM_DELAY_MS=1800000
```

---

## 🚀 Future Enhancements

- [ ] Schedule auto-post (cron jobs)
- [ ] Batch auto-post multiple articles
- [ ] A/B test titles
- [ ] Auto-add images
- [ ] Cross-post to multiple platforms
- [ ] Analytics tracking
- [ ] Smart tag suggestions

---

## 📞 Need Help?

### Check Logs

```bash
# Server logs
docker-compose logs -f app

# Specific error
tail -f /var/log/medium-bot/error.log
```

### Debug Mode

```typescript
// Enable debug in .env
DEBUG=true
SCREENSHOT_ON_ERROR=true
```

### Support

- Check CRAWLER_GUIDE.md
- Check PROJECT_STATUS.md
- Review error screenshots

---

**⚠️ Use Responsibly! Auto-post at your own risk.**

**Happy Auto-Posting! 📤✨**
