window.module_cards = `
<section id="cards">
    <div class="container">
        <div class="section-header">
            <h2>我的卡號中心</h2>
            <p>您於兌換中心取得的專屬數位憑證與卡號將安全存放於此。</p>
            <button class="btn btn-outline btn-sm" style="margin-top: 10px; width: auto; border-color: var(--glow-1); color: var(--glow-1);" onclick="window.clearAllCards()">🗑️ 一鍵清空所有卡號</button>
        </div>
        <div class="features-grid" id="cards-container"></div>
    </div>
</section>
`;

window.renderCards = function() {
    const container = document.getElementById('cards-container');
    if(!container) return;
    
    if(!window.currentUser) {
        container.innerHTML = '<p style="text-align:center; width:100%; color:var(--text-muted);">請先登入以檢視您的專屬卡號</p>';
        return;
    }

    const db = window.getDB();
    const myCards = db[window.currentUser].cards || [];

    if(myCards.length === 0) {
        container.innerHTML = '<p style="text-align:center; width:100%; color:gray;">您的庫存中目前沒有卡號，請前往兌換中心獲取。</p>';
        return;
    }

    container.innerHTML = myCards.slice().reverse().map(c => `
        <div class="glow-card-wrapper" style="border-radius: 12px;">
            <div style="background: rgba(19, 21, 28, 0.95); padding: 1.5rem; border-radius: 10px; height: 100%; display: flex; flex-direction: column; border: 1px solid rgba(0, 238, 255, 0.2);">
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                    <span style="font-size: 0.8rem; color: var(--text-muted);">訂單: ${c.orderId}</span>
                    <span style="font-size: 0.8rem; color: var(--text-muted);">${c.date}</span>
                </div>
                <h4 style="margin-bottom: 15px; color: var(--text-main); font-size: 1.1rem;">🎁 ${c.itemName}</h4>
                <div style="background: rgba(0,0,0,0.5); padding: 15px; border-radius: 8px; text-align: center; margin-top: auto; border: 1px dashed var(--glow-4);">
                    <span style="font-size: 0.8rem; color: gray; display: block; margin-bottom: 5px;">專屬兌換卡號</span>
                    <span class="text-glow-warm" style="font-size: 1.3rem; letter-spacing: 2px;">${c.cardNumber}</span>
                </div>
            </div>
        </div>
    `).join('');
};

// 新增：一鍵清理卡號邏輯
window.clearAllCards = function() {
    if(!window.currentUser) { 
        window.openModal('login-modal'); 
        return; 
    }
    
    const db = window.getDB();
    const myCards = db[window.currentUser].cards || [];
    
    if(myCards.length === 0) {
        alert('目前沒有任何卡號可以清理！');
        return;
    }
    
    if(confirm('⚠️ 警告：確定要清空所有卡號與兌換卷紀錄嗎？\n清空後將無法復原！')) {
        db[window.currentUser].cards = []; // 清空陣列
        window.saveDB(db);
        window.renderCards(); // 重新渲染畫面
        alert('✅ 卡號中心已清空！');
    }
};