window.module_game539 = `
<section id="game539">
    <div class="container">
        <div class="section-header">
            <h2>今彩 539 預測活動</h2>
            <p>每日精準預測，完全免費！猜中即可獲得專屬兌換卷，大獎等您拿。</p>
        </div>
        <div id="game539-content"></div>
    </div>
</section>
`;

window.renderGame539 = function() {
    const container = document.getElementById('game539-content');
    if(!container) return;

    if(!window.currentUser) {
        container.innerHTML = `<div class="glow-card-wrapper" style="max-width:600px; margin:0 auto;"><div class="feature-card" style="text-align:center;"><span style="font-size:4rem; margin-bottom:10px; display:inline-block;">🔒</span><h3>請先登入</h3><p style="color:gray;">登入後即可參與 539 預測活動。</p></div></div>`;
        return;
    }

    const db = window.getDB();
    const userGrp = db[window.currentUser].group || '無社群';
    const isSuper = db[window.currentUser].level === '超級管理員';
    const canManage = window.hasPerm('manage_539');

    // 權限牆
    if(userGrp !== '社群人員' && !isSuper && !canManage) {
        container.innerHTML = `
            <div class="glow-card-wrapper" style="max-width:600px; margin:0 auto;">
                <div class="feature-card" style="text-align:center;">
                    <span style="font-size:4rem; margin-bottom:10px; display:inline-block; opacity:0.8;">⛔</span>
                    <h3 style="margin:10px 0; color:var(--glow-1);">權限不足</h3>
                    <p style="color:gray;">此活動僅限「社群人員」參與，請聯繫管理員為您開通權限。</p>
                </div>
            </div>
        `;
        return;
    }

    let gameData = JSON.parse(localStorage.getItem('nexus539')) || { isOpen: false, isPaused: false, date: '', winningNumbers: [], participants: [] };
    let hasParticipated = gameData.participants.some(p => p.user === window.currentUser);

    // 狀態 1: 被管理員暫停 (等待開獎中)
    if(gameData.isOpen && gameData.isPaused) {
        if(hasParticipated) {
            let myRecord = gameData.participants.find(p => p.user === window.currentUser);
            container.innerHTML = `
                <div class="glow-card-wrapper" style="max-width:600px; margin:0 auto;">
                    <div class="feature-card" style="text-align:center;">
                        <span style="font-size:4rem; margin-bottom:10px; display:inline-block; animation: pulse 2s infinite;">⏸️</span>
                        <h3 style="margin:10px 0;">已停止開放預測，請靜候開獎</h3>
                        <p style="color:gray; font-size:0.9rem; margin-top:5px;">您的幸運號碼：</p>
                        <p style="color:var(--glow-2); font-size:2rem; letter-spacing:5px; margin-top:10px; font-weight:bold; background:rgba(0,0,0,0.5); padding:10px; border-radius:8px; border:1px dashed var(--glow-2);">${myRecord.nums.join(' ')}</p>
                        <p style="color:var(--glow-4); font-size:0.9rem; margin-top:20px;">📌 系統將於每日開獎後自動比對並派發獎勵！</p>
                    </div>
                </div>
            `;
        } else {
            container.innerHTML = `
                <div class="glow-card-wrapper" style="max-width:600px; margin:0 auto;">
                    <div class="feature-card" style="text-align:center;">
                        <span style="font-size:4rem; margin-bottom:10px; display:inline-block; opacity:0.8;">⏸️</span>
                        <h3 style="margin:10px 0;">已停止開放預測</h3>
                        <p style="color:gray; margin-top:10px;">請等候下期活動開放。</p>
                    </div>
                </div>
            `;
        }
        return;
    }

    // 狀態 2: 已經結算關閉 (顯示上一期開獎紀錄)
    if(!gameData.isOpen) {
        let winnersHtml = (gameData.participants || []).filter(p => p.matched >= 2).map(p => `<div style="margin-bottom:5px; border-bottom:1px dashed rgba(255,255,255,0.1); padding-bottom:5px;"><span style="color:var(--glow-4);">${p.user}</span> 猜中 ${p.matched} 碼 <span style="color:var(--glow-2);">獲得兌換卷</span></div>`).join('');
        
        container.innerHTML = `
            <div class="glow-card-wrapper" style="max-width:600px; margin:0 auto;">
                <div class="feature-card" style="text-align:center;">
                    <span style="font-size:4rem; margin-bottom:10px; display:inline-block; opacity:0.8;">🔒</span>
                    <h3 style="margin:10px 0;">今日預測尚未開放</h3>
                    <p style="color:gray;">請等待管理員開啟活動，或公布今日開獎結果。</p>
                    
                    ${gameData.winningNumbers && gameData.winningNumbers.length > 0 ? `
                    <div style="margin-top:20px; padding:15px; background:rgba(0,0,0,0.5); border-radius:8px; border:1px solid var(--glow-4);">
                        <span style="font-size:0.8rem; color:gray; display:block; margin-bottom:5px;">上期開獎號碼</span>
                        <h4 class="text-glow-warm" style="font-size:1.8rem; letter-spacing:5px;">${gameData.winningNumbers.join(' ')}</h4>
                    </div>` : ''}
                    
                    <div style="margin-top:20px; text-align:left; background:rgba(255,255,255,0.05); padding:15px; border-radius:8px;">
                        <h5 style="color:var(--glow-2); border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:5px; margin-bottom:10px;">🏆 近期中獎英雄榜 (中2碼以上)</h5>
                        <div class="custom-scroll" style="max-height:150px; overflow-y:auto; font-size:0.9rem;">
                            ${winnersHtml || '<span style="color:gray; font-size:0.8rem;">本期尚無中獎紀錄，下次大獎就是你！</span>'}
                        </div>
                    </div>
                </div>
            </div>
        `;
        return;
    }

    // 狀態 3: 正常開放中
    if(hasParticipated) {
        let myRecord = gameData.participants.find(p => p.user === window.currentUser);
        container.innerHTML = `
            <div class="glow-card-wrapper" style="max-width:600px; margin:0 auto;">
                <div class="feature-card" style="text-align:center;">
                    <span style="font-size:4rem; margin-bottom:10px; display:inline-block;">✅</span>
                    <h3 style="margin:10px 0;">您已完成今日預測</h3>
                    <p style="color:gray; font-size:0.9rem; margin-top:5px;">您的幸運號碼：</p>
                    <p style="color:var(--glow-2); font-size:2rem; letter-spacing:5px; margin-top:10px; font-weight:bold; background:rgba(0,0,0,0.5); padding:10px; border-radius:8px; border:1px dashed var(--glow-2);">${myRecord.nums.join(' ')}</p>
                    <p style="color:var(--glow-4); font-size:0.9rem; margin-top:20px;">📌 系統將於每日開獎後自動比對，<br>中獎者將自動派發兌換卷至卡號中心！</p>
                </div>
            </div>
        `;
    } else {
        container.innerHTML = `
            <div class="glow-card-wrapper" style="max-width:600px; margin:0 auto;">
                <div class="feature-card" style="text-align:center;">
                    <span style="font-size:3rem; margin-bottom:10px; display:inline-block;">🔮</span>
                    <h3 style="margin-bottom:10px;">輸入您的幸運 4 碼</h3>
                    <p style="color:gray; font-size:0.9rem; margin-bottom:20px;">請輸入 01 ~ 39 之間的不重複數字。<br><span style="color:var(--glow-4);">完全免費參與！大獎等您拿！</span></p>
                    <div style="display:flex; flex-wrap:wrap; gap:10px; justify-content:center; margin-bottom:25px;">
                        <input type="number" id="num1" class="form-control" style="width:70px; text-align:center; font-size:1.2rem; font-weight:bold; color:var(--glow-4);" min="1" max="39" placeholder="00">
                        <input type="number" id="num2" class="form-control" style="width:70px; text-align:center; font-size:1.2rem; font-weight:bold; color:var(--glow-4);" min="1" max="39" placeholder="00">
                        <input type="number" id="num3" class="form-control" style="width:70px; text-align:center; font-size:1.2rem; font-weight:bold; color:var(--glow-4);" min="1" max="39" placeholder="00">
                        <input type="number" id="num4" class="form-control" style="width:70px; text-align:center; font-size:1.2rem; font-weight:bold; color:var(--glow-4);" min="1" max="39" placeholder="00">
                    </div>
                    <button class="btn btn-glow" style="width:100%; font-size:1.1rem; padding:1rem;" onclick="window.submit539()">確認送出預測</button>
                </div>
            </div>
        `;
    }
};

window.submit539 = function() {
    let gameData = JSON.parse(localStorage.getItem('nexus539')) || { isOpen: true, isPaused: false, participants: [] };
    
    if(gameData.isPaused || !gameData.isOpen) {
        alert('⛔ 目前已停止開放預測！');
        window.renderGame539();
        return;
    }

    let n1 = document.getElementById('num1').value.trim().padStart(2, '0');
    let n2 = document.getElementById('num2').value.trim().padStart(2, '0');
    let n3 = document.getElementById('num3').value.trim().padStart(2, '0');
    let n4 = document.getElementById('num4').value.trim().padStart(2, '0');

    let nums = [n1, n2, n3, n4];
    if(nums.includes("00") || nums.includes("NaN")) { alert('請填滿四個格子！'); return; }
    let valid = nums.every(n => parseInt(n) >= 1 && parseInt(n) <= 39);
    let unique = new Set(nums).size === 4;

    if(!valid) { alert('請輸入 01 ~ 39 之間的數字！'); return; }
    if(!unique) { alert('四個數字絕對不能重複！'); return; }

    gameData.participants.push({ user: window.currentUser, nums: nums, matched: 0 });
    localStorage.setItem('nexus539', JSON.stringify(gameData));
    
    alert('✅ 預測成功！祝您幸運中獎！');
    window.renderGame539();
};

window.renderAdmin539 = function() {
    const statusEl = document.getElementById('admin-539-status');
    if(!statusEl) return;
    
    let gameData = JSON.parse(localStorage.getItem('nexus539')) || { isOpen: false, isPaused: false, participants: [] };
    let pCount = (gameData.participants || []).length;
    
    if(gameData.isOpen) {
        if(gameData.isPaused) {
            statusEl.innerHTML = `狀態：<span style="color:var(--glow-4); font-weight:bold;">⏸️ 已停止預測 (等候開獎)</span> | 目前參與人數: ${pCount} 人`;
        } else {
            statusEl.innerHTML = `狀態：<span style="color:#33ffcc; font-weight:bold;">🟢 開放預測中</span> | 目前參與人數: ${pCount} 人`;
        }
    } else {
        statusEl.innerHTML = `狀態：<span style="color:#ff3366; font-weight:bold;">🔴 已關閉</span> | 上期參與人數: ${pCount} 人`;
    }
};

window.toggle539 = function(openStatus) {
    let gameData = JSON.parse(localStorage.getItem('nexus539')) || { isOpen: false, isPaused: false, participants: [], winningNumbers: [] };
    
    if(openStatus) {
        if(confirm('開啟新的一局將會清空昨日的所有參與者名單，確定開啟嗎？')) {
            gameData.isOpen = true;
            gameData.isPaused = false;
            gameData.date = new Date().toLocaleDateString('zh-TW');
            gameData.participants = [];
            gameData.winningNumbers = [];
            localStorage.setItem('nexus539', JSON.stringify(gameData));
            alert('✅ 539 預測活動已開啟！');
        }
    } else {
        gameData.isOpen = false;
        gameData.isPaused = false;
        localStorage.setItem('nexus539', JSON.stringify(gameData));
        alert('🔴 539 活動已關閉！');
    }
    
    window.renderAdmin539();
    if(window.renderGame539) window.renderGame539();
};

window.pause539 = function() {
    let gameData = JSON.parse(localStorage.getItem('nexus539')) || { isOpen: false, isPaused: false, participants: [], winningNumbers: [] };
    if(!gameData.isOpen) return alert('活動尚未開啟，無法暫停！');
    if(gameData.isPaused) return alert('目前已經是停止預測狀態！');
    
    gameData.isPaused = true;
    localStorage.setItem('nexus539', JSON.stringify(gameData));
    alert('⏸️ 已停止開放預測！使用者將無法繼續下注。');
    
    window.renderAdmin539();
    if(window.renderGame539) window.renderGame539();
};