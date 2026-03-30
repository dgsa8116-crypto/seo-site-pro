window.module_redeem = `
<section id="redeem">
    <div class="container">
        <div class="section-header">
            <h2>積分兌換中心</h2>
            <p>消耗您的核心積分，兌換專屬數位資產、實體商品或解鎖高級系統權限。</p>
        </div>
        <div class="features-grid" id="rewards-container"></div>
    </div>
</section>
`;

window.renderRewards = function() {
    const container = document.getElementById('rewards-container');
    if(!container) return;
    const rewards = JSON.parse(localStorage.getItem('nexusRewards')) || [];
    let html = '';
    rewards.forEach(r => {
        if(r.status === 'hidden') return;
        html += `
        <div class="glow-card-wrapper">
            <article class="feature-card">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <div style="font-size:2.5rem;">${r.icon || '🎁'}</div>
                    <div class="task-reward-box" style="border-color:var(--glow-3);"><span class="text-glow-warm">所需 ${r.points}</span></div>
                </div>
                <h3 style="margin: 1.5rem 0 0.5rem;">${r.name}</h3>
                <p style="font-size:0.9rem; flex:1; color:var(--text-muted);">${r.desc}</p>
                <button class="btn btn-outline btn-sm" style="border-color:var(--glow-3); color:var(--glow-3);" onclick="window.redeemItem(${r.id}, '${r.name}', ${r.points})">立即兌換</button>
            </article>
        </div>`;
    });
    container.innerHTML = html || '<p style="text-align:center; width:100%; color:gray;">商品補貨中</p>';
};

window.redeemItem = function(id, name, pts) {
    if(!window.currentUser) { window.openModal('login-modal'); return; }
    const db = window.getDB();
    if(db[window.currentUser].points < pts) return alert(`積分不足！\n您目前只有 ${db[window.currentUser].points} 積分`);
    
    if(confirm(`確認消耗 ${pts} 積分兌換「${name}」？`)) {
        db[window.currentUser].points -= pts;
        
        if(name.includes('稱號') || name.includes('徽章')) {
            db[window.currentUser].badge = `<span class="text-glow-warm" style="font-size:0.8rem; border:1px solid var(--glow-4); padding:2px 8px; border-radius:15px; background:rgba(0,0,0,0.5);">${name}</span>`;
            alert(`🎉 兌換成功！\n已自動為您裝備專屬流光稱號：${name}`);
        } else {
            const orderId = 'ORD-' + Date.now().toString().slice(-6) + '-' + Math.floor(Math.random()*1000).toString().padStart(3,'0');
            const cardNum = 'NEXUS-' + Math.random().toString(36).substr(2,4).toUpperCase() + '-' + Math.random().toString(36).substr(2,4).toUpperCase();
            if(!db[window.currentUser].cards) db[window.currentUser].cards = [];
            db[window.currentUser].cards.push({ orderId: orderId, itemName: name, cardNumber: cardNum, date: new Date().toLocaleString() });
            alert(`🎉 兌換成功！\n系統已配發專屬卡號，請前往「卡號中心 Cards」查看。`);
        }
        
        if(!db[window.currentUser].pointHistory) db[window.currentUser].pointHistory = [];
        db[window.currentUser].pointHistory.push({date: new Date().toLocaleString(), action: `兌換商品: ${name}`, amount: pts, type:'spend', module:'兌換中心'});
        window.saveDB(db);
        
        document.getElementById('display-points').innerText = db[window.currentUser].points;
        const badgeEl = document.getElementById('display-badge');
        if(db[window.currentUser].badge) { badgeEl.innerHTML = db[window.currentUser].badge; badgeEl.style.display = 'block'; }
        if(window.renderCards) window.renderCards();
    }
};