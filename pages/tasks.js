window.module_tasks = `
<section id="tasks">
    <div class="container">
        <div class="section-header">
            <h2>懸賞任務中心</h2>
            <p>完成聯盟指定任務，積分將自動核發。請注意部分任務需手動點擊驗證。</p>
        </div>
        <div class="features-grid" id="tasks-container"></div>
    </div>
</section>
`;

window.renderTasks = function() {
    const container = document.getElementById('tasks-container');
    if(!container) return;
    const tasks = JSON.parse(localStorage.getItem('nexusTasks')) || [];
    let html = '';
    tasks.forEach(t => {
        if(t.status === 'hidden') return;
        html += `
        <div class="glow-card-wrapper">
            <article class="feature-card">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <div style="font-size:2rem;">${t.icon||'📌'}</div>
                    <div class="task-reward-box" style="border-color:${t.color||'var(--glow-2)'}40;"><span class="text-glow-warm">+${t.points} 積分</span></div>
                </div>
                <h3 style="margin: 1.5rem 0 1rem;">${t.name}</h3>
                <p style="font-size:0.9rem; flex:1; color:var(--text-muted);">點擊下方按鈕前往指定平台完成動作後，系統會自動發放對應積分。</p>
                <button class="btn btn-outline btn-sm task-btn" data-task-name="${t.name}" onclick="window.handleTask(this, ${t.points}, '${t.name}', '${t.url}')">前往任務</button>
            </article>
        </div>`;
    });
    container.innerHTML = html || '<p style="text-align:center; width:100%; color:gray;">目前無開放任務</p>';
    if(window.restoreTasksState) window.restoreTasksState();
};

window.handleTask = function(btn, pts, name, url) {
    if(!window.currentUser) { window.openModal('login-modal'); return; }
    window.open(url, '_blank');
    btn.innerText = "驗證中...";
    btn.className = 'btn btn-glow btn-sm task-btn';
    setTimeout(() => {
        const db = window.getDB();
        if(!db[window.currentUser].completedTasks) db[window.currentUser].completedTasks = [];
        const isCompleted = db[window.currentUser].completedTasks.some(t => typeof t === 'string' ? t === name : t.name === name);
        if(isCompleted) return window.markTaskCompleted(btn);
        
        db[window.currentUser].points += pts;
        const now = new Date().toLocaleString();
        db[window.currentUser].completedTasks.push({ name: name, date: now });
        if(!db[window.currentUser].pointHistory) db[window.currentUser].pointHistory = [];
        db[window.currentUser].pointHistory.push({date: now, action: `完成任務: ${name}`, amount: pts, type:'earn', module:'任務中心'});
        window.saveDB(db);
        
        document.getElementById('display-points').innerText = db[window.currentUser].points;
        window.markTaskCompleted(btn);
        alert(`恭喜獲得 ${pts} 積分！`);
    }, 2000);
};

window.markTaskCompleted = function(btn) { btn.innerText = '已完成'; btn.className = 'btn btn-disabled btn-sm task-btn'; btn.onclick = null; };
window.restoreTasksState = function() {
    const db = window.getDB();
    if(!window.currentUser || !db[window.currentUser].completedTasks) return;
    document.querySelectorAll('.task-btn').forEach(btn => {
        const isCompleted = db[window.currentUser].completedTasks.some(t => typeof t === 'string' ? t === btn.dataset.taskName : t.name === btn.dataset.taskName);
        if (isCompleted) window.markTaskCompleted(btn);
    });
};