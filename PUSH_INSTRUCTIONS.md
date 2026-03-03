# 🚀 Hướng Dẫn Push Code Lên GitHub

## Cách 1: SSH (Khuyến nghị)

### Bước 1: Copy SSH Public Key

Chạy lệnh:
```bash
cat ~/.ssh/id_ed25519_medium_bot.pub
```

Copy toàn bộ output (bắt đầu bằng `ssh-ed25519 ...`)

### Bước 2: Add Key vào GitHub

1. Truy cập: https://github.com/settings/keys
2. Click **"New SSH key"**
3. Title: `Medium Bot Manager - VM`
4. Paste key vào ô "Key"
5. Click **"Add SSH key"**

### Bước 3: Test SSH

```bash
ssh -T git@github.com
```

Nếu thấy: `Hi devhoangkien! You've successfully authenticated...` ✅

### Bước 4: Push Code

```bash
cd /home/ubuntu/.openclaw/workspace/medium-bot-manager
git push -u origin main
```

---

## Cách 2: HTTPS với Token

### Bước 1: Tạo Personal Access Token

1. Vào: https://github.com/settings/tokens
2. Click **"Generate new token (classic)"**
3. Note: `Medium Bot Manager`
4. Expiration: `No expiration`
5. Scopes: tick **`repo`** (Full control of private repositories)
6. Click **"Generate token"**
7. **COPY TOKEN NGAY** (sẽ không hiện lại lần 2)

### Bước 2: Push với Token

```bash
cd /home/ubuntu/.openclaw/workspace/medium-bot-manager
git remote set-url origin https://github.com/devhoangkien/medium-mgt.git
git push -u origin main
```

Khi hỏi username/password:
- Username: `devhoangkien`
- Password: **Paste token** ở trên (không phải password GitHub)

---

## ✅ Sau Khi Push Xong

Code sẽ có tại: https://github.com/devhoangkien/medium-mgt

### Clone về máy khác:

```bash
# SSH
git clone git@github.com:devhoangkien/medium-mgt.git

# HTTPS
git clone https://github.com/devhoangkien/medium-mgt.git
```

---

## 📞 Cần Trợ Giúp?

Nếu gặp vấn đề, check:

1. SSH key đã add đúng chưa?
2. Repo có tồn tại ở chế độ private không?
3. Token còn hạn không?

---

**Quick Commands:**

```bash
# Xem remote hiện tại
git remote -v

# Xem các branches
git branch -a

# Xem status
git status

# Commit changes mới
git add -A
git commit -m "Your message"
git push
```
