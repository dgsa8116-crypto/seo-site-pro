# livegame_scraper.py
# ═══════════════════════════════════════════════════════════
# 百家樂全自動走勢攔截引擎 v3
# 同時支援 本機 file:// 模式 和 遠端 GitHub Pages 模式
#
# 安裝: pip install selenium webdriver-manager
# 用法: python livegame_scraper.py
# ═══════════════════════════════════════════════════════════

import json, time, re, os, glob
from datetime import datetime
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from webdriver_manager.chrome import ChromeDriverManager

# ═══════════════════════════════════════════════════════════
# ★ 設定區 — 只改這裡
# ═══════════════════════════════════════════════════════════
# 模式: 'remote' = GitHub Pages 網址（推薦）
#        'local'  = 本機 index.html
MODE = 'remote'

# remote 模式用：你的 GitHub Pages 網址
REMOTE_URL = 'https://dgsa8116-crypto.github.io/seo-site-pro/'

# local 模式用：留空=自動搜尋
LOCAL_PATH = ''

POLL_INTERVAL = 2   # 掃描間隔秒數
# ═══════════════════════════════════════════════════════════


def ts():
    return datetime.now().strftime('%H:%M:%S')


def find_local_html():
    if LOCAL_PATH and os.path.exists(LOCAL_PATH):
        return LOCAL_PATH
    sd = os.path.dirname(os.path.abspath(__file__))
    dp = os.path.join(sd, "index.html")
    if os.path.exists(dp): return dp
    dp2 = os.path.join(sd, "..", "index.html")
    if os.path.exists(dp2): return os.path.abspath(dp2)
    for p in [r"~\Desktop\*\index.html", r"~\Desktop\*\*\index.html",
              r"~\桌面\*\index.html", r"~\桌面\*\*\index.html",
              r"~\Downloads\*\index.html", r"~\Downloads\*\*\index.html"]:
        for m in glob.glob(os.path.expanduser(p)):
            try:
                with open(m,'r',encoding='utf-8') as f:
                    if 'NexusCloud' in f.read(2000): return m
            except: continue
    print("⚠️  找不到 index.html，請輸入完整路徑:")
    up = input("路徑: ").strip().strip('"')
    return up if os.path.exists(up) else None


def classify_element(el):
    classes = (el.get_attribute("class") or "").lower()
    text = (el.text or "").strip().lower()
    style = (el.get_attribute("style") or "").lower()
    blob = f"{classes} {text} {style}"
    if any(k in blob for k in ["莊","banker","zhuang"]): return "B"
    if any(k in blob for k in ["閒","player","xian"]): return "P"
    if any(k in blob for k in ["和","tie"]): return "T"
    if any(k in classes for k in ["red","b-","banker","result-b"]): return "B"
    if any(k in classes for k in ["blue","p-","player","result-p"]): return "P"
    if any(k in classes for k in ["green","t-","tie","result-t"]): return "T"
    try:
        bg = el.value_of_css_property("background-color")
        if bg:
            nums = [int(x) for x in re.findall(r'\d+', bg)]
            if len(nums) >= 3:
                r,g,b = nums[0],nums[1],nums[2]
                if r>180 and g<100 and b<100: return "B"
                if b>180 and r<100 and g<100: return "P"
                if g>180 and r<100 and b<100: return "T"
                if r>200 and g<80: return "B"
                if b>200 and r<80: return "P"
    except: pass
    return None


def scan_iframe(driver):
    results = []
    try:
        iframe = driver.find_element(By.ID, "livegame-iframe")
        driver.switch_to.frame(iframe)
    except: return results

    try:
        for sel in ["[class*='result']","[class*='road'] [class*='item']",
                     "[class*='road'] td","[class*='bead'] div","[class*='Road'] div",
                     "table.road td","table[class*='road'] td",
                     ".bead-road .bead",".road-bead .item",".game-road div"]:
            try:
                els = driver.find_elements(By.CSS_SELECTOR, sel)
                if len(els) < 3: continue
                temp = []
                for el in els:
                    sz = el.size
                    if sz['width']>60 or sz['height']>60: continue
                    if sz['width']<5 or sz['height']<5: continue
                    r = classify_element(el)
                    if r: temp.append({"r":r,"bp":False,"pp":False})
                if len(temp)>=3: results=temp; break
            except: continue

        if not results:
            try:
                body = driver.find_element(By.TAG_NAME,"body").text
                bm = re.search(r'[莊B]\s*[：:]*\s*(\d+)', body)
                pm = re.search(r'[閒P]\s*[：:]*\s*(\d+)', body)
                tm = re.search(r'[和T]\s*[：:]*\s*(\d+)', body)
                if bm and pm:
                    return {"stats":True,"B":int(bm.group(1)),"P":int(pm.group(1)),"T":int(tm.group(1)) if tm else 0}
            except: pass
    except Exception as e:
        print(f"[{ts()}] iframe 掃描異常: {e}")
    finally:
        driver.switch_to.default_content()
    return results


def push_data(driver, records, mode="append"):
    payload = json.dumps({"mode":mode,"records":records}, ensure_ascii=False)
    escaped = payload.replace("\\","\\\\").replace("'","\\'")
    driver.execute_script(f"if(window.updateLivegameFromPython){{window.updateLivegameFromPython('{escaped}')}}")


def main():
    print()
    print("═"*60)
    print("  NexusCloud 百家樂攔截引擎 v3")
    print("═"*60)
    print()

    if MODE == 'remote':
        target = REMOTE_URL
        print(f"[{ts()}] 模式: 遠端 GitHub Pages")
        print(f"[{ts()}] 網址: {target}")
    else:
        path = find_local_html()
        if not path:
            print("❌ 找不到 index.html"); return
        target = "file:///" + path.replace("\\","/")
        print(f"[{ts()}] 模式: 本機")
        print(f"[{ts()}] 路徑: {target}")

    print(f"\n[{ts()}] 啟動 Chrome...")

    opts = Options()
    opts.add_argument("--disable-web-security")
    opts.add_argument("--allow-file-access-from-files")
    opts.add_argument("--disable-features=IsolateOrigins,site-per-process")
    opts.add_experimental_option("excludeSwitches",["enable-automation"])
    opts.add_argument("--start-maximized")

    svc = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=svc, options=opts)

    try:
        driver.get(target)
        print(f"[{ts()}] ✅ 網站已開啟")

        # ── 等登入 ──
        print(f"[{ts()}] ⏳ 請在瀏覽器中登入帳號...")
        while True:
            try:
                u = driver.execute_script("return window.currentUser")
                if u: print(f"[{ts()}] ✅ 登入成功: {u}"); break
            except: pass
            time.sleep(2)

        # ── 跳轉 Live Game ──
        try:
            driver.execute_script("window.location.hash='livegame'")
            time.sleep(1)
        except: pass

        # ── 等 iframe ──
        print(f"[{ts()}] ⏳ 等待 Live Game iframe（請確認已綁定遊戲網址）...")
        while True:
            try:
                src = driver.execute_script(
                    "var f=document.getElementById('livegame-iframe');return f?f.src:''")
                if src and src.startswith('http') and len(src)>20:
                    print(f"[{ts()}] ✅ iframe 就緒")
                    break
            except: pass
            time.sleep(2)

        print(f"\n[{ts()}] 🎯 開始攔截！請在遊戲畫面選擇廳房")
        print(f"[{ts()}] {'─'*50}")

        prev_count = 0; idle = 0

        while True:
            try:
                h = driver.execute_script("return window.location.hash") or ''
                if 'livegame' not in h:
                    idle += 1
                    if idle%30==0: print(f"[{ts()}] ⚠ 不在 Live Game 頁面")
                    time.sleep(POLL_INTERVAL); continue

                data = scan_iframe(driver)

                if isinstance(data,dict) and data.get("stats"):
                    total = data["B"]+data["P"]+data["T"]
                    if total>0:
                        print(f"[{ts()}] 統計: 莊{data['B']} 閒{data['P']} 和{data['T']} (共{total}局)")
                        idle=0

                elif isinstance(data,list) and len(data)>0:
                    if len(data)!=prev_count:
                        if prev_count==0:
                            push_data(driver,data,"full")
                            print(f"[{ts()}] 🎯 首次同步: {len(data)} 局")
                        else:
                            new = data[prev_count:]
                            push_data(driver,new,"append")
                            for nr in new:
                                lb={'B':'莊','P':'閒','T':'和'}.get(nr['r'],'?')
                                print(f"[{ts()}] 🆕 {lb} → 推送 (累計 {len(data)} 局)")
                        prev_count=len(data); idle=0
                    else: idle+=1
                else:
                    idle+=1
                    if idle==15: print(f"[{ts()}] ⏳ 尚未偵測到盤路，請確認已進入遊戲房間...")
                    elif idle%60==0: print(f"[{ts()}] ⏳ 持續監控中...")

            except Exception as e:
                if "no such window" in str(e).lower():
                    print(f"[{ts()}] 瀏覽器已關閉"); break
                idle+=1

            time.sleep(POLL_INTERVAL)

    except KeyboardInterrupt:
        print(f"\n[{ts()}] Ctrl+C 結束")
    except Exception as e:
        print(f"[{ts()}] 錯誤: {e}")
    finally:
        try: driver.quit()
        except: pass


if __name__=="__main__":
    main()
