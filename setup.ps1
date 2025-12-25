# 1. 初始化目錄結構
$dirs = @("components", "data", "pages/api", "public/uploads", "scripts", "styles", ".github/workflows")
foreach ($dir in $dirs) {
    if (!(Test-Path $dir)) {
        New-Item -ItemType Directory -Force -Path $dir | Out-Null
        Write-Host "Created directory: $dir"
    }
}

# 2. 定義檔案內容函數
function Write-File ($path, $content) {
    $dir = Split-Path $path
    if (!(Test-Path $dir)) { New-Item -ItemType Directory -Force -Path $dir | Out-Null }
    Set-Content -Path $path -Value $content -Encoding UTF8
    Write-Host "Created file: $path"
}

# 3. 寫入設定檔
Write-File "package.json" @'
{
  "name": "seo-site-pro",
  "version": "2.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "postbuild": "next-sitemap",
    "start": "next start",
    "seo:refresh": "node scripts/generate-meta.mjs",
    "img:compress": "node scripts/compress-images.mjs"
  },
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "node-fetch": "^3.3.2",
    "sharp": "^0.32.6"
  },
  "devDependencies": {
    "next-sitemap": "^4.2.3"
  }
}
'@

Write-File "next.config.js" @'
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  images: { unoptimized: true }
};
module.exports = nextConfig;
'@

Write-File "jsconfig.json" @'
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
'@

Write-File "next-sitemap.config.js" @'
/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://tntlinebotseemyeyes.online',
  generateRobotsTxt: true,
  outDir: 'out',
};
'@

# 4. 寫入 GitHub Actions
Write-File ".github/workflows/daily-seo.yml" @'
name: Daily SEO Auto-Update
on:
  schedule:
    - cron: '0 0 * * *'
  workflow_dispatch:

permissions:
  contents: write

jobs:
  update-keywords:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v3

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install Dependencies
        run: npm ci

      - name: Fetch Trends & Update JSON
        run: node scripts/generate-meta.mjs

      - name: Commit & Push Changes
        run: |
          git config --global user.name 'SEO Bot'
          git config --global user.email 'bot@noreply.github.com'
          git add data/seo.json
          git diff --quiet && git diff --staged --quiet || (git commit -m "chore(seo): update daily trends keywords" && git push)
'@

# 5. 寫入 SEO 與 數據腳本
Write-File "scripts/generate-meta.mjs" @'
import fs from "fs";
import path from "path";
import fetch from "node-fetch";

const seoPath = path.join(process.cwd(), "data", "seo.json");

async function getTrendsTW() {
  try {
    const r = await fetch("https://trends.google.com/trends/api/dailytrends?geo=TW");
    const text = await r.text();
    const json = JSON.parse(text.replace(/^\)]}'\n?/, ""));
    return json?.default?.trendingSearchesDays?.[0]?.trendingSearches?.map(t => t.title.query) || [];
  } catch (e) {
    console.error("Fetch trends failed:", e.message);
    return [];
  }
}

async function run() {
  try {
    const trends = await getTrendsTW();
    if (trends.length > 0) {
      const currentSeo = JSON.parse(fs.readFileSync(seoPath, "utf8"));
      const newKeywords = Array.from(new Set([...trends, ...(currentSeo.keywords || [])])).slice(0, 30);
      currentSeo.keywords = newKeywords;
      currentSeo.description = `最新熱門搜尋：${trends.slice(0, 6).join("、")}... 獨家技術｜AI學習演算法｜多種判定引擎`;
      fs.writeFileSync(seoPath, JSON.stringify(currentSeo, null, 2), "utf8");
      console.log("[Auto-SEO] Updated successfully with:", trends.slice(0, 5));
    } else {
      console.log("[Auto-SEO] No trends found, skipping update.");
    }
  } catch (e) {
    console.error("[Auto-SEO] Critical Error:", e);
    process.exit(1);
  }
}

run();
'@

# 6. 寫入資料檔
Write-File "data/seo.json" @'
{
  "title": "天眼通III不正常人類研究中心｜AI預測程式｜百家樂大數據",
  "description": "最新熱門搜尋：AI、大數據... 獨家技術｜絕非市面上氾濫計算機算法，帶入AI學習演算法",
  "url": "https://tntlinebotseemyeyes.online",
  "keywords": ["AI", "天眼通", "預測", "大數據"],
  "image": "/og-image.png"
}
'@

Write-File "data/content.json" @'
{
  "brand": "天眼通III不正常人類研究中心",
  "hero": {
    "title": "前往註冊BEC",
    "subtitle": "先有註冊才有後續，開啟你的 AI 預測之旅。",
    "image": "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1600&auto=format&fit=crop",
    "cta": { "label": "立即註冊", "href": "https://becgame88168.com/?uffr=dgsa001" }
  },
  "services": {
    "title": "其餘服務業務",
    "items": [
      {
        "title": "智能客服中心",
        "description": "最溫馨的客服服務，減少不必要的損失。",
        "image": "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800",
        "link": "https://line.me/R/ti/p/@bec168",
        "badge": "LINE"
      },
      {
        "title": "LINEBOT預測程式",
        "description": "AI學習模組最豐富的排組組合。",
        "image": "https://images.unsplash.com/photo-1552581234-26160f608093?w=800",
        "link": "https://line.me/R/ti/p/@564lzkqd"
      },
      {
        "title": "天眼通申請序號",
        "description": "跨渠道整合，決策效率大幅提升。",
        "image": "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800",
        "link": "https://line.me/R/ti/p/@622bugzl",
        "badge": "DEMO"
      }
    ]
  },
  "portfolio": {
    "title": "核心推薦",
    "items": [
      {
        "title": "極簡介面 優質服務",
        "description": "往後餘生請交給我們。",
        "image": "https://images.unsplash.com/photo-1492724441997-5dc865305da7?w=800"
      },
      {
        "title": "優質學習服務",
        "description": "技術 SEO、語意內容、A/B 實驗。",
        "image": "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800"
      },
      {
        "title": "產品設計開發",
        "description": "從雛型到上線，高品質前端。",
        "image": "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800"
      }
    ]
  }
}
'@

# 7. 寫入頁面元件
Write-File "components/SEO.js" @'
import Head from "next/head";

export default function SEO({ meta }) {
  const {
    title,
    description,
    url = "https://tntlinebotseemyeyes.online",
    image = "/og-image.png",
    keywords = []
  } = meta || {};
  
  const imgUrl = image?.startsWith("http") ? image : url + image;

  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords.join(", ")} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="theme-color" content="#00e5ff" />
      <meta property="og:type" content="website" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={imgUrl} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imgUrl} />
      <link rel="icon" href="/favicon.ico" />
    </Head>
  );
}
'@

Write-File "pages/index.js" @'
import fs from "fs";
import path from "path";
import SEO from "@/components/SEO";

export async function getStaticProps() {
  const root = process.cwd();
  const data = JSON.parse(fs.readFileSync(path.join(root, "data", "content.json"), "utf8"));
  const meta = JSON.parse(fs.readFileSync(path.join(root, "data", "seo.json"), "utf8"));
  
  return { props: { data, meta } };
}

export default function Home({ data, meta }) {
  return (
    <>
      <SEO meta={meta} />
      <nav className="nav">
        <div className="container nav-inner">
          <div className="brand"><span className="dot"></span>{data.brand}</div>
          <div className="hidden-mobile">關於我們 ・ 服務 ・ 作品 ・ 聯絡</div>
        </div>
      </nav>

      <header className="container hero">
        <div className="hero-content">
          <h1>{data.hero.title}</h1>
          <p className="muted">{data.hero.subtitle}</p>
          {data.hero?.cta && (
            <a className="btn" href={data.hero.cta.href} target="_blank" rel="noopener noreferrer">
              {data.hero.cta.label}
            </a>
          )}
        </div>
        <img className="hero-img" src={data.hero.image} alt={data.hero.title} />
      </header>

      <section className="section">
        <div className="container">
          <h2 className="section-title">{data.services.title}</h2>
        </div>
        <div className="container grid-3">
          {data.services.items.map((s, i) => (
            <div className="card" key={i}>
              <img src={s.image} alt={s.title} loading="lazy" />
              <div className="body">
                <h3>
                  {s.title}
                  {s.badge && <span className="badge">{s.badge}</span>}
                </h3>
                <p className="muted">{s.description}</p>
                {s.link && (
                  <a className="btn-sm" href={s.link} target="_blank" rel="noopener noreferrer">
                    前往
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 className="section-title">{data.portfolio.title}</h2>
        </div>
        <div className="container grid-3">
          {data.portfolio.items.map((p, i) => (
            <div className="card" key={i}>
              <img src={p.image} alt={p.title} loading="lazy" />
              <div className="body">
                <h3>{p.title}</h3>
                <p className="muted">{p.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer className="footer muted">
        © {new Date().getFullYear()} {data.brand}
      </footer>
    </>
  );
}
'@

Write-File "styles/globals.css" @'
:root {
  --bg: #05050a;
  --line: rgba(255, 255, 255, .1);
  --text: #e8f3ff;
  --muted: #9fb0c3;
  --neon: #00e5ff;
  --neon2: #7b61ff;
}
* { box-sizing: border-box; }
body {
  margin: 0;
  font-family: Inter, "Noto Sans TC", system-ui, sans-serif;
  background: 
    radial-gradient(800px 400px at 80% -10%, rgba(123, 97, 255, .3), transparent 60%),
    radial-gradient(1000px 600px at -10% 30%, rgba(0, 229, 255, .25), transparent 60%),
    var(--bg);
  color: var(--text);
  line-height: 1.6;
}
.container { width: min(1200px, 92%); margin: 0 auto; }
.nav {
  position: sticky; top: 0; z-index: 20;
  background: rgba(5, 5, 10, .8); backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--line);
}
.nav-inner { display: flex; align-items: center; justify-content: space-between; height: 64px; }
.brand { font-weight: 700; display: flex; align-items: center; gap: 10px; font-size: 1.1rem; }
.dot {
  width: 10px; height: 10px; border-radius: 50%;
  background: linear-gradient(90deg, var(--neon), var(--neon2));
  box-shadow: 0 0 10px var(--neon);
}
.section { padding: 80px 0; }
.section-title { font-size: 2rem; margin-bottom: 40px; text-align: center; }
.hero {
  display: grid; grid-template-columns: 1fr 1fr; gap: 48px; align-items: center; padding: 100px 0;
}
.hero h1 { font-size: 3rem; margin: 0 0 20px; line-height: 1.2; background: linear-gradient(to right, #fff, #b0b0b0); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.hero-img { width: 100%; border-radius: 24px; border: 1px solid var(--line); box-shadow: 0 20px 40px rgba(0,0,0,0.5); }
.grid-3 { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 30px; }
.card {
  background: rgba(255, 255, 255, .03);
  border: 1px solid var(--line); border-radius: 20px;
  overflow: hidden; transition: all .3s ease;
}
.card:hover { transform: translateY(-5px); border-color: var(--neon); box-shadow: 0 10px 30px rgba(0, 229, 255, .1); }
.card img { width: 100%; height: 220px; object-fit: cover; }
.card .body { padding: 24px; }
.card h3 { margin: 0 0 10px; display: flex; align-items: center; justify-content: space-between; }
.btn, .btn-sm {
  display: inline-block; padding: 12px 30px; border-radius: 99px;
  color: #fff; text-decoration: none; font-weight: 600;
  background: linear-gradient(90deg, var(--neon), var(--neon2));
  transition: all .2s; box-shadow: 0 0 20px rgba(0, 229, 255, .3);
}
.btn:hover { transform: scale(1.05); box-shadow: 0 0 30px rgba(0, 229, 255, .6); }
.btn-sm { padding: 6px 16px; font-size: 0.9rem; box-shadow: none; }
.badge {
  font-size: .7rem; background: rgba(0, 229, 255, .1); color: var(--neon);
  border: 1px solid var(--neon); padding: 2px 8px; border-radius: 99px;
}
.muted { color: var(--muted); }
.footer { padding: 60px 0; text-align: center; border-top: 1px solid var(--line); margin-top: 60px; }
@media (max-width: 768px) {
  .hero { grid-template-columns: 1fr; text-align: center; }
  .hidden-mobile { display: none; }
  .hero h1 { font-size: 2.2rem; }
}
'@

Write-File "pages/_app.js" @'
import "@/styles/globals.css"
export default function App({ Component, pageProps }) {
  return <Component {...pageProps} />
}
'@

Write-Host "專案檔案建立完成！"