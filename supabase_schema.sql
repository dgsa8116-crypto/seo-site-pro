-- ============================================================
-- NexusCloud Database Schema for Supabase
-- 
-- 使用方式：
--   1. 登入 Supabase Dashboard → 進入你的專案
--   2. 點選左側「SQL Editor」
--   3. 貼上此檔案的全部內容
--   4. 點選「Run」執行
-- ============================================================

-- 核心鍵值存儲表：儲存所有系統資料（會員資料庫、任務、賽事等）
CREATE TABLE IF NOT EXISTS nexus_store (
    key   TEXT PRIMARY KEY,
    data  JSONB NOT NULL DEFAULT '{}',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 自動更新 updated_at 時間戳
CREATE OR REPLACE FUNCTION update_nexus_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_nexus_updated ON nexus_store;
CREATE TRIGGER trigger_nexus_updated
    BEFORE UPDATE ON nexus_store
    FOR EACH ROW
    EXECUTE FUNCTION update_nexus_timestamp();

-- 初始化預設資料（首次執行時插入）
INSERT INTO nexus_store (key, data) VALUES
    ('nexusDB', '{}'),
    ('nexusGroups', '["社群人員","無社群"]'),
    ('nexusSections', '[]'),
    ('nexusTasks', '[{"id":1,"name":"[官方] 註冊驗證","points":500,"url":"#","icon":"任務","color":"var(--g4)","status":"active"}]'),
    ('nexusRewards', '[{"id":1,"name":"1日遊玩卡","points":1000,"desc":"解鎖體驗","icon":"票券","color":"var(--g2)","status":"active"}]'),
    ('nexusSportsData', '[]'),
    ('nexus539', '{"isOpen":false,"isPaused":false,"date":"","winningNumbers":[],"participants":[]}'),
    ('nexusTitleGroups', '[]'),
    ('nexusRegLog', '[]'),
    ('nexusGifts', '[]')
ON CONFLICT (key) DO NOTHING;

-- ============================================================
-- Row Level Security（RLS）設定
-- 
-- 因為此應用使用 anon key 從瀏覽器直接存取，
-- 需要開啟 RLS 並允許 anon 角色讀寫。
-- 正式環境建議進一步限制存取範圍。
-- ============================================================

ALTER TABLE nexus_store ENABLE ROW LEVEL SECURITY;

-- 允許匿名使用者讀取所有資料
CREATE POLICY "Allow anon read" ON nexus_store
    FOR SELECT TO anon USING (true);

-- 允許匿名使用者寫入（INSERT / UPDATE）
CREATE POLICY "Allow anon insert" ON nexus_store
    FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow anon update" ON nexus_store
    FOR UPDATE TO anon USING (true) WITH CHECK (true);

-- ============================================================
-- 完成！現在回到 index.html 填入你的 Supabase URL 和 anon key
-- ============================================================
