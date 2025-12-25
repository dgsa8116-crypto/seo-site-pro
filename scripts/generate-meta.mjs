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
