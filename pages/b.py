# 請先開啟終端機 (Terminal) 或命令提示字元 (cmd) 安裝所需套件：
# pip install selenium webdriver-manager

import json
import time
import random
import os
import glob
from datetime import datetime
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager

# ═══════════════════════════════════════════════════════════
# 自動尋找 index.html 路徑
# ═══════════════════════════════════════════════════════════
def find_index_html():
    """
    自動尋找 index.html 檔案位置
    搜尋順序:
    1. 與本腳本同資料夾
    2. 上層資料夾
    3. 桌面上常見資料夾名稱
    4. 使用者手動輸入
    """
    script_dir = os.path.dirname(os.path.abspath(__file__))
    
    # 1. 與腳本同資料夾
    direct_path = os.path.join(script_dir, "index.html")
    if os.path.exists(direct_path):
        return direct_path
    
    # 2. 上層資料夾 (假設腳本在 pages/ 子目錄)
    parent_path = os.path.join(os.path.dirname(script_dir), "index.html")
    if os.path.exists(parent_path):
        return parent_path
    
    # 3. 搜尋常見路徑 (Windows)
    search_patterns = [
        os.path.expanduser(r"~\Desktop\*\index.html"),
        os.path.expanduser(r"~\Desktop\*\*\index.html"),
        os.path.expanduser(r"~\桌面\*\index.html"),
        os.path.expanduser(r"~\Downloads\*\index.html"),
    ]
    
    for pattern in search_patterns:
        matches = glob.glob(pattern)
        for match in matches:
            try:
                with open(match, 'r', encoding='utf-8') as f:
                    if 'NexusCloud' in f.read(2000):
                        return match
            except:
                continue
    
    # 4. 手動輸入
    print("═" * 60)
    print("⚠️  無法自動找到 index.html")
    print("═" * 60)
    print(r"請輸入完整路徑，例如: C:\Users\Admin\Desktop\KOBE\index.html")
    user_path = input("路徑: ").strip().strip('"').strip("'")
    return user_path if os.path.exists(user_path) else None

# 自動尋找路徑
_found_path = find_index_html()
if _found_path:
    HTML_FILE_PATH = "file:///" + _found_path.replace("\\", "/")
    print(f"✅ 已找到前端檔案: {HTML_FILE_PATH}")
else:
    print("❌ 無法啟動，請確認 index.html 存在")
    exit(1)

def scrape_sports_data():
    """
    此函式負責執行爬蟲作業 (可在此串接台灣運彩 API 或 Beautifulsoup 爬取邏輯)
    為確保程式能立即運行測試，此處先以自動動態生成數據做為資料源。
    """
    categories = [
        {"cat": "basketball", "league": "NBA 籃球", "color": "var(--glow-4)"},
        {"cat": "baseball", "league": "MLB 棒球", "color": "var(--glow-2)"},
        {"cat": "soccer", "league": "足球 五大聯賽", "color": "var(--glow-1)"},
        {"cat": "tennis", "league": "網球 巡迴賽", "color": "#00ffaa"},
        {"cat": "esports", "league": "電競 LoL", "color": "var(--glow-3)"}
    ]
    analysts = ["Nexus AI 運算核心", "首席分析師 K", "東方神秘力量", "數據精算師", "運彩老司機"]
    
    # 模擬爬取到的賽事清單
    crawled_data = []
    
    # 隨機產生 5~10 筆即時賽事
    for i in range(random.randint(5, 10)):
        c = random.choice(categories)
        probA = random.randint(30, 70)
        probB = 100 - probA
        
        match = {
            "id": int(time.time()) + i,
            "category": c["cat"],
            "league": c["league"],
            "date": random.choice(["today", "tomorrow"]),
            "time": f"{random.randint(8, 23):02d}:{random.choice(['00', '15', '30', '45'])}",
            "teamA": f"主隊_{random.randint(1,99)}",
            "teamB": f"客隊_{random.randint(1,99)}",
            "cost": random.choice([30, 50, 80, 100, 150]),
            "prediction": {
                "winProbA": probA,
                "winProbB": probB,
                "recommend": random.choice(["主隊 讓分勝 (-1.5)", "客隊 不讓分", "全場總分 大", "雙方皆進球 (是)"]),
                "analysis": "根據即時爬蟲抓取的盤口賠率變動與莊家資金流向，模型判定此對戰組合各項數據已達收斂，推薦此投注方向。",
                "analyst": random.choice(analysts),
                "confidence": "🔥" * random.randint(3, 5)
            },
            "color": c["color"]
        }
        crawled_data.append(match)
        
    return crawled_data

def main():
    print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] 啟動 NexusCloud 自動化數據引擎...")
    
    # 設定 Chrome 瀏覽器選項
    chrome_options = Options()
    # 若希望瀏覽器在背景隱藏執行，請取消下方註解
    # chrome_options.add_argument("--headless") 
    chrome_options.add_argument("--disable-web-security")
    chrome_options.add_argument("--allow-file-access-from-files")
    chrome_options.add_experimental_option("excludeSwitches", ["enable-automation"])

    # 自動下載對應版本的 ChromeDriver 並啟動
    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=chrome_options)
    
    try:
        # 開啟本機 HTML 檔案
        driver.get(HTML_FILE_PATH)
        print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] 成功連線至前端介面，等待初始化...")
        time.sleep(3) # 等待前端 JS 與 DOM 完全載入

        # 持續運行的爬蟲與注入迴圈
        while True:
            # 1. 執行爬蟲，取得最新賽事資料
            latest_sports_data = scrape_sports_data()
            
            # 2. 將 Python 字典轉換為 JSON 字串
            json_data_string = json.dumps(latest_sports_data, ensure_ascii=False)
            
            # 3. 呼叫前端 index.html 預留的 JS API，將數據注入網頁並強制重新渲染
            js_command = f"window.updateSportsDataFromPython('{json_data_string}');"
            driver.execute_script(js_command)
            
            print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] 爬蟲執行完畢，已成功推送 {len(latest_sports_data)} 筆即時賽事至前端。")
            
            # 4. 休息指定時間後再抓取一次 (例如：每 60 秒更新一次盤口)
            time.sleep(60)
            
    except KeyboardInterrupt:
        print(f"\n[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] 接收到中斷指令，系統安全關閉。")
    except Exception as e:
        print(f"發生未預期錯誤: {e}")
    finally:
        driver.quit()

if __name__ == "__main__":
    main()