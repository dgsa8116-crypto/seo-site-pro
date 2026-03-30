# NexusCloud 資料庫設定指南

## 為什麼需要資料庫？

原本的系統使用瀏覽器的 `localStorage` 儲存帳號資料，這表示：
- ❌ 換個瀏覽器或裝置，帳號就消失了
- ❌ 清除瀏覽器資料，帳號就沒了
- ❌ 不同使用者之間的資料無法共享

改用 Supabase（免費的 PostgreSQL 雲端資料庫）後：
- ✅ 任何瀏覽器、任何裝置都能登入同一個帳號
- ✅ 資料永久保存在雲端資料庫
- ✅ 所有使用者共享同一份資料

---

## 設定步驟（約 5 分鐘）

### 第一步：建立 Supabase 專案

1. 前往 [https://supabase.com](https://supabase.com)
2. 點擊「Start your project」→ 用 GitHub 帳號登入
3. 點擊「New project」
4. 填寫：
   - **Project name**: `nexuscloud`（或任何你喜歡的名稱）
   - **Database Password**: 設一個強密碼（記好，但程式碼中不需要用到）
   - **Region**: 選 `Northeast Asia (Tokyo)` 離台灣最近
5. 點擊「Create new project」，等待約 1-2 分鐘

### 第二步：建立資料表

1. 在 Supabase Dashboard 左側選單，點擊 **SQL Editor**
2. 點擊「New query」
3. 打開專案中的 `supabase_schema.sql` 檔案，複製全部內容
4. 貼到 SQL Editor 中
5. 點擊 **Run**（右上角綠色按鈕）
6. 看到 `Success. No rows returned` 表示成功

### 第三步：取得連線資訊

1. 在 Supabase Dashboard 左側選單，點擊 **Settings**（齒輪圖示）
2. 點擊 **API**
3. 你需要複製兩個值：
   - **Project URL** → 類似 `https://xxxxxxxxxxxx.supabase.co`
   - **anon / public** key → 一串很長的字串（在 `Project API keys` 區域）

### 第四步：填入程式碼

打開 `index.html`，找到最上方的設定區（搜尋 `管理員設定區`）：

```javascript
const NEXUS_SUPABASE_URL  = '';   // 填入 Project URL
const NEXUS_SUPABASE_KEY  = '';   // 填入 anon public key
```

改為：

```javascript
const NEXUS_SUPABASE_URL  = 'https://xxxxxxxxxxxx.supabase.co';
const NEXUS_SUPABASE_KEY  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxx...';
```

### 第五步：部署並測試

1. 將修改後的檔案推送到 GitHub
2. 等待 GitHub Pages 部署完成
3. 打開網站 → 右上角應該顯示「☁ 資料庫已同步」
4. 試試註冊一個帳號
5. 換另一個瀏覽器（或無痕視窗）→ 用同一個帳號登入 → 成功！

---

## 驗證資料庫是否正常運作

### 方法一：看同步狀態
- `☁ 資料庫已同步` → 正常連線中
- `💾 本機模式` → 未設定 Supabase（仍使用 localStorage）
- `⚠ 資料庫異常` → 連線失敗，請檢查 URL 和 Key

### 方法二：瀏覽器 Console
按 F12 開啟開發者工具 → Console，正常應該看到：
```
[NexusDB] ✅ 資料庫連線成功，所有資料已從雲端載入
```

### 方法三：Supabase Dashboard 查看資料
1. 進入 Supabase Dashboard → 點擊 **Table Editor**
2. 選擇 `nexus_store` 表
3. 可以看到所有資料，包括 `nexusDB`（會員資料）、`nexusRegLog`（註冊日誌）等

---

## 常見問題

### Q: 原本 localStorage 裡的舊帳號怎麼辦？
A: 第一次連上 Supabase 時，如果 Supabase 的 `nexusDB` 還是空的 `{}`，
   而你的瀏覽器 localStorage 有舊資料，你可以：
   1. 先在瀏覽器 Console 執行 `NexusGist.push()` 把本機資料推上雲端
   2. 之後所有瀏覽器都會從雲端拉取這份資料

### Q: anon key 放在前端安全嗎？
A: Supabase 的 anon key 設計上就是可以公開的（類似 Firebase 的 config）。
   安全性由 Row Level Security (RLS) 控制。
   本 Schema 已設定基本的 RLS 政策。

### Q: 免費額度夠用嗎？
A: Supabase 免費方案提供：
   - 500 MB 資料庫空間
   - 無限 API 請求
   - 50,000 月活躍使用者
   對一般網站來說綽綽有餘。

### Q: 多人同時操作會衝突嗎？
A: 系統採用「最後寫入者獲勝」策略，與原本 Gist 同步相同。
   一般使用場景下不會有問題。

---

## 檔案清單

| 檔案 | 說明 |
|------|------|
| `index.html` | 主程式（已改為 Supabase 引擎） |
| `supabase_schema.sql` | 資料庫建表 SQL（在 Supabase SQL Editor 執行） |
| `SETUP_DATABASE.md` | 本設定指南 |
