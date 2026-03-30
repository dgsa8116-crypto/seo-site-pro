# 🚀 NexusCloud SEO Site Pro

[![Auto Update SEO](https://github.com/dgsa8116-crypto/seo-site-pro/actions/workflows/seo-update.yml/badge.svg)](https://github.com/dgsa8116-crypto/seo-site-pro/actions/workflows/seo-update.yml)
[![GitHub Pages](https://img.shields.io/badge/GitHub-Pages-blue)](https://dgsa8116-crypto.github.io/seo-site-pro/)

企業級雲端管理平台，具備自動 SEO 優化功能，讓 Google 排名持續提升！

## 🌐 線上預覽

**網站網址：** [https://dgsa8116-crypto.github.io/seo-site-pro/](https://dgsa8116-crypto.github.io/seo-site-pro/)

## ✨ 功能特色

### 核心功能
- 🎨 **流光視覺設計** - 漸層色彩動態效果
- 👤 **會員系統** - 註冊/登入/積分管理
- 🏆 **賽事預測** - NBA/MLB/足球/電競分析
- 🎰 **539 預測活動** - 每日免費參與抽獎
- 🎮 **真人遊戲** - 百家樂走勢分析
- 📊 **後台管理** - 會員/任務/商品管理
- 📱 **響應式設計** - 支援手機/平板/電腦

### SEO 自動優化
- 🔄 **每日自動更新** - Sitemap、Meta 標籤自動更新
- 📈 **動態關鍵詞** - 根據季節自動調整關鍵詞
- 🏷️ **結構化數據** - Schema.org JSON-LD
- 🌍 **多搜尋引擎支援** - Google、Bing、百度等
- 📊 **Open Graph** - Facebook/Twitter 分享優化

## 📁 專案結構

```
seo-site-pro/
├── index.html              # 主程式 (含完整 SEO)
├── sitemap.xml             # 網站地圖 (自動更新)
├── robots.txt              # 搜尋引擎爬蟲規則
├── seo-config.json         # SEO 關鍵詞配置
├── _config.yml             # GitHub Pages 配置
├── README.md               # 說明文件
├── .gitignore              # Git 忽略檔案
├── .github/
│   └── workflows/
│       └── seo-update.yml  # 自動 SEO 更新工作流程
└── pages/                  # 模組與爬蟲腳本
    ├── analytics.js
    ├── b.py                # 賽事爬蟲 (自動路徑)
    ├── cards.js
    ├── checkin.js
    ├── contact.js
    ├── footer.js
    ├── game539.js
    ├── home.js
    ├── livegame_scraper.py # 百家樂走勢攔截
    ├── nexus_api.json
    ├── redeem.js
    ├── scraper.py          # 539 開獎爬蟲
    ├── sports.js
    └── tasks.js
```

## 🚀 部署到 GitHub Pages

### 步驟 1：建立 GitHub Repository
1. 登入 GitHub
2. 點擊 "New repository"
3. 命名為 `seo-site-pro`
4. 設為 Public

### 步驟 2：上傳檔案
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/你的帳號/seo-site-pro.git
git push -u origin main
```

### 步驟 3：啟用 GitHub Pages
1. 進入 Repository → Settings → Pages
2. Source 選擇 "GitHub Actions"
3. 等待部署完成

### 步驟 4：提交到 Google Search Console
1. 前往 [Google Search Console](https://search.google.com/search-console)
2. 新增資源：`https://你的帳號.github.io/seo-site-pro/`
3. 驗證方式選擇 HTML 標籤
4. 提交 Sitemap：`https://你的帳號.github.io/seo-site-pro/sitemap.xml`

## 🔧 SEO 自動更新機制

GitHub Actions 會每天自動執行：

1. **更新 Sitemap** - 修改 lastmod 日期
2. **更新 Meta 標籤** - 修改 dateModified
3. **重新部署** - 自動部署到 GitHub Pages

手動觸發：
1. 進入 Actions 頁面
2. 選擇 "Auto Update SEO"
3. 點擊 "Run workflow"

## 📊 SEO 效果追蹤

建議使用以下工具追蹤排名：
- [Google Search Console](https://search.google.com/search-console) - 免費
- [Ahrefs](https://ahrefs.com/) - 付費
- [SEMrush](https://www.semrush.com/) - 付費
- [Ubersuggest](https://neilpatel.com/ubersuggest/) - 部分免費

## 🔑 管理員密鑰

升級超級管理員：`NEXUS-ADMIN-777`

## 📝 更新日誌

### v2.0 (2026-03-29)
- ✅ 新增完整 SEO 優化
- ✅ 新增 GitHub Actions 自動更新
- ✅ 新增 Sitemap 和 robots.txt
- ✅ 新增結構化數據 (Schema.org)
- ✅ 修復未登入時會員資料顯示問題
- ✅ Python 爬蟲自動路徑搜尋

## 📄 授權

© 2026 NexusCloud Technology Ltd. 保留所有權利。
