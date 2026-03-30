window.module_sports = `
<section id="sports">
    <div class="container">
        <div class="section-header">
            <h2>賽事預測 Sports</h2>
            <p>由頂尖 AI 模型與全球權威球評提供的精準賽事分析。需消耗積分以解鎖深度預測。</p>
        </div>
        
        <div style="display:flex; gap:10px; margin-bottom:2rem; flex-wrap:wrap; background:rgba(255,255,255,0.05); padding:15px; border-radius:12px; border:1px solid rgba(0,238,255,0.2);">
            <select id="sports-date-filter" class="form-control" style="width:auto; margin-bottom:0; flex:1; min-width:120px;" onchange="window.renderSports()">
                <option value="all">📅 所有時間</option>
                <option value="today">今日賽事</option>
                <option value="tomorrow">明日賽事</option>
            </select>
            <select id="sports-category-filter" class="form-control" style="width:auto; margin-bottom:0; flex:2; min-width:180px;" onchange="window.renderSports()">
                <option value="all">🏅 所有球種 (大小賽事)</option>
                <option value="basketball">🏀 籃球 (NBA / 各國職籃)</option>
                <option value="baseball">⚾ 棒球 (MLB / 中職 / 日職)</option>
                <option value="soccer">⚽ 足球 (五大聯賽 / 盃賽)</option>
                <option value="tennis">🎾 網球 (大滿貫 / 巡迴賽)</option>
                <option value="esports">🎮 電競 (LoL / 其他賽事)</option>
            </select>
        </div>

        <div class="features-grid" id="sports-container"></div>
    </div>
</section>
`;

window.renderSports = function() {
    const container = document.getElementById('sports-container');
    if(!container) return;

    const dateFilter = document.getElementById('sports-date-filter').value;
    const catFilter = document.getElementById('sports-category-filter').value;
    const allMatches = JSON.parse(localStorage.getItem('nexusSportsData')) || [];
    
    const matches = allMatches.filter(m => {
        let dateMatch = (dateFilter === 'all' || m.date === dateFilter);
        let catMatch = (catFilter === 'all' || m.category === catFilter);
        return dateMatch && catMatch;
    });

    if(matches.length === 0) {
        container.innerHTML = '<p style="text-align:center; width:100%; color:gray; grid-column: 1 / -1; padding: 3rem;">目前無符合條件的賽事</p>';
        return;
    }

    const db = window.getDB();
    const unlockedList = (window.currentUser && db[window.currentUser]) ? (db[window.currentUser].unlockedSports || []) : [];

    container.innerHTML = matches.map(m => {
        const isUnlocked = unlockedList.includes(m.id);
        let contentHtml = '';

        if(isUnlocked) {
            contentHtml = `
                <div style="background:rgba(0,0,0,0.5); padding:15px; border-radius:8px; border:1px dashed ${m.color}; margin-bottom:1rem; text-align:center;">
                    <span style="font-size:0.85rem; color:gray; display:block; margin-bottom:5px;">💡 專業盤口推薦</span>
                    <span class="text-glow-warm" style="font-size:1.3rem;">${m.prediction.recommend}</span>
                    
                    <div style="display:flex; height:8px; border-radius:4px; overflow:hidden; margin-top:15px; background:#333;">
                        <div style="width: ${m.prediction.winProbA}%; background: var(--glow-2);"></div>
                        <div style="width: ${m.prediction.winProbB}%; background: var(--glow-1);"></div>
                    </div>
                    <div style="display:flex; justify-content:space-between; font-size:0.8rem; margin-top:5px; font-weight:bold;">
                        <span style="color: var(--glow-2);">${m.teamA}勝率 ${m.prediction.winProbA}%</span>
                        <span style="color: var(--glow-1);">${m.teamB}勝率 ${m.prediction.winProbB}%</span>
                    </div>
                </div>
                <p style="font-size:0.95rem; color:var(--text-muted); line-height:1.6; flex:1;"><strong>深度解析：</strong>${m.prediction.analysis}</p>
                <div style="display:flex; justify-content:space-between; align-items:center; margin-top:1rem; border-top:1px solid rgba(255,255,255,0.1); padding-top:10px;">
                    <span style="font-size:0.85rem; color:gray;">預測分析師: ${m.prediction.analyst}</span>
                    <span style="font-size:0.85rem; color:var(--glow-4);">信心：${m.prediction.confidence}</span>
                </div>
            `;
        } else {
            contentHtml = `
                <div style="flex:1; display:flex; flex-direction:column; justify-content:center; align-items:center; background:rgba(0,0,0,0.3); border-radius:8px; padding:2rem; border:1px solid rgba(255,255,255,0.05);">
                    <span style="font-size:2.5rem; margin-bottom:10px; opacity:0.8;">🔒</span>
                    <p style="color:gray; font-size:0.9rem; margin-bottom:15px; text-align:center;">此場預測已鎖定<br>解鎖即可查看精準盤口與勝率預測</p>
                    <button class="btn btn-outline btn-sm" style="border-color:${m.color}; color:${m.color}; width:auto;" onclick="window.unlockSports(${m.id}, ${m.cost}, '${m.teamA} vs ${m.teamB}')">消耗 ${m.cost} 積分解鎖</button>
                </div>
            `;
        }

        return `
        <div class="glow-card-wrapper">
            <article class="feature-card">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
                    <span style="background:${m.color}; color:#000; padding:3px 10px; border-radius:10px; font-size:0.8rem; font-weight:bold;">${m.league}</span>
                    <span style="color:var(--text-muted); font-size:0.8rem;">${m.date==='today'?'今日':(m.date==='tomorrow'?'明日':m.date)} ${m.time}</span>
                </div>
                <div style="text-align:center; margin-bottom:1.5rem;">
                    <h3 style="font-size:1.5rem; margin-bottom:0.5rem; line-height:1.3;"><span style="color:white">${m.teamA}</span> <span style="font-size:1rem; color:gray; display:inline-block; margin:0 5px;">VS</span> <span style="color:white">${m.teamB}</span></h3>
                </div>
                ${contentHtml}
            </article>
        </div>`;
    }).join('');
};

window.unlockSports = function(matchId, cost, matchName) {
    if(!window.currentUser) { window.openModal('login-modal'); return; }
    
    const db = window.getDB();
    if(db[window.currentUser].points < cost) { 
        alert(`您的積分不足！需要 ${cost} 積分。\n您目前剩餘：${db[window.currentUser].points} 積分`); 
        return; 
    }

    if(confirm(`確認消耗 ${cost} 積分解鎖「${matchName}」的賽事預測？`)) {
        db[window.currentUser].points -= cost;
        if(!db[window.currentUser].unlockedSports) db[window.currentUser].unlockedSports = [];
        db[window.currentUser].unlockedSports.push(matchId);
        
        if(!db[window.currentUser].pointHistory) db[window.currentUser].pointHistory = [];
        db[window.currentUser].pointHistory.push({ date: new Date().toLocaleString(), action: `解鎖賽事預測: ${matchName}`, amount: cost, type:'spend', module:'賽事預測' });
        
        window.saveDB(db);
        document.getElementById('display-points').innerText = db[window.currentUser].points;
        window.renderSports(); 
        alert('✅ 解鎖成功！分析數據已展開。');
    }
};