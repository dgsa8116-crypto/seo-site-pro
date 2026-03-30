# NexusCloud 完整設定指南

---

## 一、資料庫設定（帳號密碼永久保存）

### 為什麼帳號會消失？
原本用瀏覽器 `localStorage` 存帳號 → 換瀏覽器/清資料就沒了。
改用 Supabase 雲端資料庫 → 任何裝置都能登入。

### Step 1：建立 Supabase 專案（免費）

1. 打開 **https://supabase.com** → 「Start your project」
2. 用 GitHub 帳號登入
3. 「New project」→ 填：
   - Name: `nexuscloud`
   - Password: 隨便設一組（程式碼不用填）
   - Region: **Northeast Asia (Tokyo)**
4. 點「Create new project」→ 等 1~2 分鐘

### Step 2：建立資料表

1. 左側選單 → **SQL Editor**
2. 點「New query」
3. 把 `supabase_schema.sql` 的**全部內容**複製貼上
4. 點右上角 **Run**
5. 看到 `Success` = 完成

### Step 3：取得連線資訊

1. 左側 → **Settings** (⚙️) → **API**
2. 複製這兩個值：
   - **Project URL** → `https://xxxxxxxxxxxx.supabase.co`
   - **anon public key** → `eyJhbG...` 那串很長的

### Step 4：填入程式碼

打開 `index.html`，搜尋 `管理員設定區`，改成：

```javascript
const NEXUS_SUPABASE_URL  = 'https://你的.supabase.co';
const NEXUS_SUPABASE_KEY  = 'eyJhbG你的key...';
```

### Step 5：推送 & 驗證

1. git push 到 GitHub
2. 打開網站 → 看左下角狀態：
   - ☁ 資料庫已同步 → ✅ 成功！
   - 💾 本機模式 → ❌ 還沒設定或 URL/Key 有誤
   - ⚠ 資料庫異常 → ❌ SQL 沒執行或 RLS 沒開
3. 註冊帳號 → 換無痕視窗登入 → 成功 = 資料庫正常

### 舊帳號遷移

如果之前 localStorage 有資料想搬到 Supabase：
1. 在有舊資料的瀏覽器上開網站
2. F12 打開 Console，輸入：`NexusGist.push()`
3. 舊資料就會推上 Supabase

---

## 二、真人遊戲 Live Game 走勢攔截

### 架構說明

Live Game 有兩個部分：
1. **iframe 遊戲畫面** → 嵌入平台網頁（綁定 URL 後自動顯示）
2. **走勢數據面板** → 需要餵資料才有數據

走勢數據來源有兩種：
- **自動**：執行 Python 爬蟲 → 自動讀取 iframe 裡的盤路
- **手動**：點頁面下方的 莊/閒/和 按鈕手動記錄

### 爬蟲使用方法（自動讀取走勢）

#### 安裝

```bash
pip install selenium webdriver-manager
```

#### 設定

打開 `pages/livegame_scraper.py`，修改設定區：

```python
# 'remote' = 開啟你的 GitHub Pages 網站（推薦）
# 'local'  = 開啟本機 index.html
MODE = 'remote'

# 填入你的 GitHub Pages 網址
REMOTE_URL = 'https://dgsa8116-crypto.github.io/seo-site-pro/'
```

#### 執行

```bash
python pages/livegame_scraper.py
```

#### 流程

1. 爬蟲自動開啟 Chrome → 載入你的網站
2. **你手動登入帳號**（在開出來的 Chrome 視窗內操作）
3. 爬蟲自動跳轉到「真人遊戲」頁面
4. **你需要先綁定遊戲平台 URL**（如果之前沒綁的話）
5. 進入遊戲房間後，爬蟲自動攔截盤路數據
6. 每局結果即時推送到前端 → 統計、AI 預測自動更新

#### 注意事項

- Chrome 會顯示「已被自動化軟體控制」→ 正常，不影響使用
- 爬蟲需要一直保持執行 → 關掉 = 停止攔截
- 跨域 iframe 攔截需要 `--disable-web-security` 旗標 → 只在爬蟲的 Chrome 啟用
- 走勢數據會自動同步到 Supabase（如果已設定資料庫的話）

### 手動記錄走勢

如果不想跑爬蟲，可以手動記錄：
1. 在 Live Game 頁面下方展開「手動記錄」
2. 每局開完點「莊」「閒」或「和」
3. 勾選「莊對」「閒對」（有的話）
4. 數據即時更新到統計面板

---

## 常見問題 FAQ

**Q: anon key 放前端安全嗎？**
A: Supabase 的 anon key 設計上就是給前端用的，安全性靠 RLS 控制。

**Q: 免費額度夠嗎？**
A: 500 MB 空間、無限 API 請求、50K 月活用戶 → 一般網站綽綽有餘。

**Q: 爬蟲能在手機上跑嗎？**
A: 不行，Selenium 需要電腦上的 Chrome。手機上用手動記錄。

**Q: 兩個人同時操作會衝突嗎？**
A: 採用最後寫入者勝的機制。一般使用不會有問題。

---

## 檔案清單

| 檔案 | 說明 |
|------|------|
| `index.html` | 主程式（已改為 Supabase 引擎）|
| `supabase_schema.sql` | 資料庫建表 SQL |
| `pages/livegame_scraper.py` | 真人遊戲走勢爬蟲 v3 |
| `SETUP.md` | 本設定指南 |
