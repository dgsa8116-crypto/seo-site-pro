window.module_checkin = `
<section id="checkin">
    <div class="container">
        <div class="section-header">
            <h2>簽到與推廣中心</h2>
            <p>每日上線領取資源，並邀請好友加入聯盟，賺取無上限的推廣積分回饋。</p>
        </div>
        <div class="features-grid">
            <div class="glow-card-wrapper">
                <article class="feature-card" style="text-align: center; justify-content: center;">
                    <div style="font-size:4rem; margin-bottom:1rem;">📅</div>
                    <h3 class="text-glow-warm" style="font-size:2rem; margin-bottom:1rem;">每日簽到</h3>
                    <p style="color:var(--text-muted); margin-bottom:2rem;">每日登入點擊即可獲得 100 核心積分。</p>
                    <button class="btn btn-glow" id="btn-daily-checkin" onclick="window.handleCheckin()" style="width:80%; font-size:1.1rem; padding:1rem;">立即簽到領取</button>
                    <p id="checkin-status" style="margin-top:1rem; font-size:0.9rem; color:var(--glow-2);"></p>
                </article>
            </div>
            
            <div class="glow-card-wrapper">
                <article class="feature-card">
                    <h3 style="margin-bottom:1rem; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:10px;">🤝 專屬推廣計畫</h3>
                    <p style="font-size:0.9rem; color:var(--text-muted); margin-bottom:1rem;">分享您的專屬連結，每成功邀請一名新會員註冊，雙方皆可獲得額外 500 積分獎勵。</p>
                    
                    <div style="background:rgba(0,0,0,0.5); padding:15px; border-radius:10px; margin-bottom:1.5rem; border:1px dashed var(--glow-3);">
                        <h4 style="color:var(--glow-2); margin-bottom:10px; font-size:1.1rem;">📣 推廣任務三部曲</h4>
                        <ol style="text-align:left; color:var(--text-muted); font-size:0.9rem; padding-left:20px; line-height:1.6; margin-bottom:0;">
                            <li>複製下方的專屬邀請碼。</li>
                            <li>前往 <strong>Facebook 相關社團</strong> 發文推廣。</li>
                            <li>截圖您的發文畫面，並附上您的帳號，私訊官方 LINE 客服：<br><span style="color:var(--glow-4); font-weight:bold; font-size:1.1rem;">@nexus_official</span> <br>審核通過後，管理員將為您派發「推廣大禮包」！</li>
                        </ol>
                    </div>

                    <div style="background:rgba(255,255,255,0.05); padding:15px; border-radius:10px; margin-bottom:1.5rem;">
                        <span style="font-size:0.8rem; color:gray; display:block; margin-bottom:5px;">您的專屬邀請碼</span>
                        <div style="display:flex; justify-content:space-between; align-items:center;">
                            <span id="promo-code" class="text-glow-warm" style="font-size:1.5rem; letter-spacing:2px;">請先登入</span>
                            <button class="btn btn-outline btn-sm" onclick="window.copyPromoLink()" style="padding:5px 10px; width:auto;">複製</button>
                        </div>
                    </div>
                    <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(0,0,0,0.3); padding:10px; border-radius:8px; border-left:3px solid var(--glow-4);">
                        <span style="font-size:0.9rem;">成功邀請人數</span>
                        <span id="promo-count" style="color:var(--glow-4); font-weight:bold; font-size:1.2rem;">0</span>
                    </div>
                </article>
            </div>
        </div>
    </div>
</section>
`;

window.renderCheckin = function() {
    let btn = document.getElementById('btn-daily-checkin');
    let status = document.getElementById('checkin-status');
    let promoCode = document.getElementById('promo-code');
    let promoCount = document.getElementById('promo-count');
    if(!btn || !promoCode) return;

    if(!window.currentUser) {
        promoCode.innerText = '請先登入';
        promoCount.innerText = '0';
        btn.className = 'btn btn-outline';
        btn.innerText = '請先登入以簽到';
        btn.onclick = () => { window.openModal('login-modal'); };
        if(status) status.innerText = '';
        return;
    }

    const db = window.getDB();
    const u = db[window.currentUser];
    
    promoCode.innerText = u.referralCode || 'NEX-ERROR';
    promoCount.innerText = (u.referrals || []).length;

    let today = new Date().toLocaleDateString('zh-TW');
    
    if(u.lastCheckIn === today) {
        btn.className = 'btn btn-disabled';
        btn.innerText = '今日已簽到';
        status.innerText = '明日再來領取新的積分吧！';
        btn.onclick = null;
    } else {
        btn.className = 'btn btn-glow';
        btn.innerText = '立即簽到領取';
        status.innerText = '';
        btn.onclick = window.handleCheckin;
    }
};

window.handleCheckin = function() {
    if(!window.currentUser) { window.openModal('login-modal'); return; }
    let db = window.getDB();
    let today = new Date().toLocaleDateString('zh-TW');
    if(db[window.currentUser].lastCheckIn === today) { alert('您今天已經簽到過了！'); return; }
    db[window.currentUser].lastCheckIn = today;
    db[window.currentUser].points += 100;
    if(!db[window.currentUser].pointHistory) db[window.currentUser].pointHistory = [];
    db[window.currentUser].pointHistory.push({date: new Date().toLocaleString(), action: '每日登入簽到', amount: 100, type:'earn', module:'簽到中心'});
    window.saveDB(db);
    alert('🎉 簽到成功！獲得 100 積分。');
    document.getElementById('display-points').innerText = db[window.currentUser].points;
    window.renderCheckin();
};

window.copyPromoLink = function() {
    if(!window.currentUser) { window.openModal('login-modal'); return; }
    const code = document.getElementById('promo-code').innerText;
    const link = window.location.origin + window.location.pathname + '?ref=' + code;
    navigator.clipboard.writeText(link).then(() => { alert('✅ 推廣連結已複製到剪貼簿！\n' + link); }).catch(err => { alert('複製失敗，請手動複製邀請碼: ' + code); });
};