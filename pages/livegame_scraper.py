# livegame_scraper.py
# ═══════════════════════════════════════════════════════════
# 百家樂全自動走勢攔截引擎
# 直接在 iframe 內部讀取 DOM，不開第二分頁、不刷新頁面
#
# 安裝: pip install selenium webdriver-manager
# 用法: python livegame_scraper.py
# ═══════════════════════════════════════════════════════════

import json
import time
import re
import os
import glob
from datetime import datetime
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from webdriver_manager.chrome import ChromeDriverManager

# ═══════════════════════════════════════════════════════════
# 自動尋找 index.html 路徑
# ═══════════════════════════════════════════════════════════
def find_index_html():
    """
    自動尋找 index.html 檔案位置
    搜尋順序:
    1. 與本腳本同資料夾
    2. 桌面上常見資料夾名稱
    3. 使用者指定路徑
    """
    # 取得腳本所在目錄
    script_dir = os.path.dirname(os.path.abspath(__file__))
    
    # 搜尋路徑清單
    search_paths = [
        # 1. 與腳本同資料夾
        os.path.join(script_dir, "index.html"),
        # 2. 常見桌面路徑 (Windows)
        os.path.expanduser(r"~\Desktop\*\index.html"),
        os.path.expanduser(r"~\Desktop\*\*\index.html"),
        os.path.expanduser(r"~\桌面\*\index.html"),
        os.path.expanduser(r"~\桌面\*\*\index.html"),
        # 3. 下載資料夾
        os.path.expanduser(r"~\Downloads\*\index.html"),
        os.path.expanduser(r"~\Downloads\*\*\index.html"),
        # 4. 文件資料夾
        os.path.expanduser(r"~\Documents\*\index.html"),
        os.path.expanduser(r"~\Documents\*\*\index.html"),
    ]
    
    # 直接檢查腳本同資料夾
    direct_path = os.path.join(script_dir, "index.html")
    if os.path.exists(direct_path):
        return direct_path
    
    # 使用 glob 搜尋
    for pattern in search_paths[1:]:
        matches = glob.glob(pattern)
        for match in matches:
            # 確認檔案內容包含 NexusCloud 特徵
            try:
                with open(match, 'r', encoding='utf-8') as f:
                    content = f.read(2000)
                    if 'NexusCloud' in content or 'NEXUS' in content:
                        return match
            except:
                continue
    
    # 如果都找不到，讓使用者手動輸入
    print("═" * 60)
    print("⚠️  無法自動找到 index.html")
    print("═" * 60)
    print("請輸入 index.html 完整路徑，例如:")
    print(r"   C:\Users\Admin\Desktop\KOBE\index.html")
    print()
    user_path = input("路徑: ").strip().strip('"').strip("'")
    
    if os.path.exists(user_path):
        return user_path
    else:
        print(f"❌ 找不到檔案: {user_path}")
        return None

# 自動尋找路徑
HTML_FILE_PATH = find_index_html()
if HTML_FILE_PATH:
    # 轉換為 file:// URL 格式
    HTML_FILE_PATH = "file:///" + HTML_FILE_PATH.replace("\\", "/")
    print(f"✅ 已找到前端檔案: {HTML_FILE_PATH}")
else:
    print("❌ 無法啟動，請確認 index.html 存在")
    exit(1)

POLL_INTERVAL = 2  # 每幾秒掃描一次 iframe 內容


def ts():
    return datetime.now().strftime('%H:%M:%S')


def classify_element(el):
    """
    判定單個盤路元素代表莊/閒/和
    根據 class、text、background-color 綜合判定
    """
    classes = (el.get_attribute("class") or "").lower()
    text = (el.text or "").strip().lower()
    style = (el.get_attribute("style") or "").lower()
    blob = f"{classes} {text} {style}"

    # 文字判定
    if any(k in blob for k in ["莊", "banker", "zhuang"]):
        return "B"
    if any(k in blob for k in ["閒", "player", "xian"]):
        return "P"
    if any(k in blob for k in ["和", "tie"]):
        return "T"

    # CSS class 判定 (紅/藍/綠)
    if any(k in classes for k in ["red", "b-", "banker", "result-b"]):
        return "B"
    if any(k in classes for k in ["blue", "p-", "player", "result-p"]):
        return "P"
    if any(k in classes for k in ["green", "t-", "tie", "result-t"]):
        return "T"

    # 背景色判定
    try:
        bg = el.value_of_css_property("background-color")
        if bg:
            # rgba(R, G, B, A) 格式
            nums = [int(x) for x in re.findall(r'\d+', bg)]
            if len(nums) >= 3:
                r, g, b = nums[0], nums[1], nums[2]
                if r > 180 and g < 100 and b < 100:
                    return "B"  # 紅 → 莊
                if b > 180 and r < 100 and g < 100:
                    return "P"  # 藍 → 閒
                if g > 180 and r < 100 and b < 100:
                    return "T"  # 綠 → 和
                if r > 200 and g < 80:
                    return "B"
                if b > 200 and r < 80:
                    return "P"
                if g > 120 and r < 100 and b < 100:
                    return "T"
    except Exception:
        pass

    return None


def scan_iframe(driver):
    """
    切入 iframe，掃描所有可能的盤路元素，回傳結果列表
    回傳格式: [{"r": "B"}, {"r": "P"}, ...] 或空 []
    """
    results = []

    try:
        # 切入 iframe
        iframe = driver.find_element(By.ID, "livegame-iframe")
        driver.switch_to.frame(iframe)
    except Exception:
        return results

    try:
        # ── 策略 1: 找所有小圓點/格子 (珠盤路元素) ──
        # 遊戲平台通常用 div/span/td 呈現每局結果
        # 嘗試多種 selector
        selectors_to_try = [
            # 通用：所有有 result 相關 class 的元素
            "[class*='result']",
            "[class*='road'] [class*='item']",
            "[class*='road'] td",
            "[class*='bead'] div",
            "[class*='Road'] div",
            # 表格式盤路
            "table.road td",
            "table[class*='road'] td",
            # 圓點式
            ".bead-road .bead",
            ".road-bead .item",
            # 通用小元素 (寬高相近的小 div)
            ".game-road div",
        ]

        for selector in selectors_to_try:
            try:
                elements = driver.find_elements(By.CSS_SELECTOR, selector)
                if len(elements) < 3:
                    continue

                temp = []
                for el in elements:
                    # 過濾太大或不可見的元素
                    size = el.size
                    if size['width'] > 60 or size['height'] > 60:
                        continue
                    if size['width'] < 5 or size['height'] < 5:
                        continue

                    r = classify_element(el)
                    if r:
                        temp.append({"r": r, "bp": False, "pp": False})

                if len(temp) >= 3:
                    results = temp
                    break
            except Exception:
                continue

        # ── 策略 2: 從統計文字解析 ──
        if not results:
            try:
                body_text = driver.find_element(By.TAG_NAME, "body").text
                # 找 "莊 17  閒 18  和 7" 之類的格式
                b_m = re.search(r'[莊B]\s*[：:]*\s*(\d+)', body_text)
                p_m = re.search(r'[閒P]\s*[：:]*\s*(\d+)', body_text)
                t_m = re.search(r'[和T]\s*[：:]*\s*(\d+)', body_text)
                if b_m and p_m:
                    # 回傳統計數據供前端處理
                    return {
                        "stats": True,
                        "B": int(b_m.group(1)),
                        "P": int(p_m.group(1)),
                        "T": int(t_m.group(1)) if t_m else 0
                    }
            except Exception:
                pass

    except Exception as e:
        print(f"[{ts()}] iframe 內部掃描異常: {e}")
    finally:
        # ⚠️ 切回主頁面 (絕對不能忘)
        driver.switch_to.default_content()

    return results


def push_data(driver, records, mode="append"):
    """推送數據到前端 (已在主頁面 context)"""
    payload = json.dumps({
        "mode": mode,
        "records": records
    }, ensure_ascii=False)
    # 用雙引號包 JSON，避免單引號衝突
    escaped = payload.replace("\\", "\\\\").replace("'", "\\'")
    js = f"if(window.updateLivegameFromPython){{window.updateLivegameFromPython('{escaped}');}}"
    driver.execute_script(js)


def main():
    print(f"[{ts()}] ═══ NexusCloud 百家樂自動攔截引擎 v2 ═══")
    print(f"[{ts()}] 模式: iframe 內部 DOM 攔截 (不開分頁、不刷新)")
    print()

    chrome_options = Options()
    chrome_options.add_argument("--disable-web-security")
    chrome_options.add_argument("--allow-file-access-from-files")
    chrome_options.add_argument("--disable-features=IsolateOrigins,site-per-process")
    chrome_options.add_experimental_option("excludeSwitches", ["enable-automation"])
    chrome_options.add_argument("--start-maximized")

    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=chrome_options)

    try:
        driver.get(HTML_FILE_PATH)
        print(f"[{ts()}] 已開啟前端，請登入 → 綁定遊戲 URL → 在畫面內選擇廳房")
        print(f"[{ts()}] 偵測到綁定 URL 和 iframe 後自動開始攔截...")
        print()

        # ── 等待 iframe 就緒 ──
        while True:
            time.sleep(2)
            try:
                has_iframe = driver.execute_script(
                    "return !!document.getElementById('livegame-iframe')"
                )
                if has_iframe:
                    src = driver.execute_script(
                        "var f=document.getElementById('livegame-iframe');"
                        "return f?f.src:'';"
                    )
                    if src and 'ofalive99' in src:
                        break
            except Exception:
                pass

        print(f"[{ts()}] ✅ iframe 已就緒，開始持續攔截走勢")
        print(f"[{ts()}] 請在上方遊戲畫面中選擇廳房，系統自動讀取盤路")
        print(f"[{ts()}] {'─' * 50}")

        prev_count = 0
        prev_stats_total = 0
        idle_count = 0

        while True:
            try:
                data = scan_iframe(driver)

                if isinstance(data, dict) and data.get("stats"):
                    # 統計模式
                    total = data["B"] + data["P"] + data["T"]
                    if total != prev_stats_total and total > 0:
                        print(f"[{ts()}] 統計偵測: 莊{data['B']} 閒{data['P']} 和{data['T']} (共{total}局)")
                        prev_stats_total = total
                        idle_count = 0

                elif isinstance(data, list) and len(data) > 0:
                    if len(data) != prev_count:
                        if prev_count == 0:
                            # 首次：完整同步
                            push_data(driver, data, mode="full")
                            print(f"[{ts()}] 🎯 首次同步: {len(data)} 局走勢已推送")
                        else:
                            # 增量：只推新局
                            new_recs = data[prev_count:]
                            push_data(driver, new_recs, mode="append")
                            for nr in new_recs:
                                label = {'B': '莊', 'P': '閒', 'T': '和'}.get(nr['r'], '?')
                                print(f"[{ts()}] 🆕 新局: {label} → 已推送 (總計 {len(data)} 局)")

                        prev_count = len(data)
                        idle_count = 0
                    else:
                        idle_count += 1
                else:
                    idle_count += 1
                    if idle_count == 15:
                        print(f"[{ts()}] ⏳ 尚未偵測到盤路元素，可能還在大廳或選廳中...")
                    elif idle_count % 60 == 0:
                        print(f"[{ts()}] ⏳ 持續監控中... (請確認已進入遊戲房間)")

            except Exception as e:
                if "no such window" in str(e).lower():
                    print(f"[{ts()}] 瀏覽器已關閉，結束程式。")
                    break
                # 其他錯誤靜默跳過，保持攔截不中斷
                idle_count += 1

            time.sleep(POLL_INTERVAL)

    except KeyboardInterrupt:
        print(f"\n[{ts()}] 使用者中斷，安全關閉。")
    except Exception as e:
        print(f"[{ts()}] 錯誤: {e}")
    finally:
        try:
            driver.quit()
        except Exception:
            pass


if __name__ == "__main__":
    main()
