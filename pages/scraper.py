# scraper.py
import json
import time
import requests
import random
import re
from bs4 import BeautifulSoup
from datetime import datetime

def fetch_539_today():
    url = "https://www.pilio.idv.tw/lto539/list.asp"
    headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
    try:
        resp = requests.get(url, headers=headers, timeout=10)
        resp.encoding = 'utf-8'
        soup = BeautifulSoup(resp.text, 'html.parser')
        
        # 建立當日日期字串 (適應 2026/03/23 或 2026/3/23 格式)
        now = datetime.now()
        today_str1 = now.strftime('%Y/%m/%d')
        today_str2 = f"{now.year}/{now.month}/{now.day}"
        
        tables = soup.find_all('table')
        for table in tables:
            rows = table.find_all('tr')
            for row in rows:
                cols = row.find_all('td')
                if len(cols) >= 2:
                    date_text = cols[0].text.strip()
                    if today_str1 in date_text or today_str2 in date_text:
                        nums_text = cols[1].text.strip()
                        # 擷取所有兩位數字
                        nums = re.findall(r'\b\d{2}\b', nums_text)
                        if len(nums) >= 5:
                            return sorted(nums[:5])
    except Exception as e:
        print(f"爬取 539 發生錯誤: {e}")
    
    return []

def scrape_data():
    print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] 開始執行自動化數據抓取程序...")

    # 1. 抓取體育賽事 (模擬資料)
    categories = [
        {"cat": "basketball", "league": "NBA 籃球", "color": "var(--glow-4)"},
        {"cat": "baseball", "league": "MLB 棒球", "color": "var(--glow-2)"},
        {"cat": "soccer", "league": "足球 五大聯賽", "color": "var(--glow-1)"},
        {"cat": "tennis", "league": "網球 巡迴賽", "color": "#00ffaa"},
        {"cat": "esports", "league": "電競 LoL", "color": "var(--glow-3)"}
    ]
    sports_data = []
    for i in range(10):
        c = random.choice(categories)
        probA = random.randint(30, 70)
        sports_data.append({
            "id": int(time.time()) + i,
            "category": c["cat"],
            "league": c["league"],
            "date": random.choice(["today", "tomorrow"]),
            "time": f"{random.randint(8, 23):02d}:{random.choice(['00', '15', '30'])}",
            "teamA": f"隊伍A_{random.randint(1,99)}",
            "teamB": f"隊伍B_{random.randint(1,99)}",
            "cost": random.choice([30, 50, 80]),
            "prediction": {
                "winProbA": probA,
                "winProbB": 100 - probA,
                "recommend": "系統推薦下注",
                "analysis": "動態爬取分析數據載入完成。",
                "analyst": "Nexus AI",
                "confidence": "🔥🔥🔥🔥"
            },
            "color": c["color"]
        })

    # 2. 抓取 539 開獎號碼
    winning_nums = fetch_539_today()
    
    # 封裝輸出 JSON
    final_data = {
        "update_time": datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
        "sports": sports_data,
        "lotto539_today": winning_nums
    }

    with open('nexus_api.json', 'w', encoding='utf-8') as f:
        json.dump(final_data, f, ensure_ascii=False, indent=4)
        
    print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] 抓取完成！已存為 nexus_api.json。 (539今日獎號: {winning_nums if winning_nums else '今日尚無有539開獎'})")

if __name__ == "__main__":
    scrape_data()