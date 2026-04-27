document.addEventListener("DOMContentLoaded", async () => {
    if (!localStorage.getItem("token")) {
        window.location.href = "index.html";
        return;
    }

    const logoutBtn = document.getElementById("logoutBtn");
    logoutBtn?.addEventListener("click", () => api.auth.logout());

    try {
        const links = await api.links.getAll();
        renderDashboard(links);
    } catch (error) {
        console.error(error);
    }
});

function renderDashboard(links) {
    document.getElementById("activeLinks").innerText = links.length;
    
    let totalScans = 0;
    links.forEach(l => totalScans += l.current_scans);
    document.getElementById("totalScans").innerText = totalScans;

    const list = document.getElementById("recentLinksList");
    if (links.length === 0) {
        list.innerHTML = `<div class="card text-center"><p>No links created yet. <a href="create.html" style="color: var(--primary)">Create your first dynamic QR!</a></p></div>`;
        return;
    }

    list.innerHTML = links.slice(0, 5).map(link => {
        const isStatic = link.short_code.startsWith('ST_');
        return `
        <div class="card flex justify-between" style="margin-bottom: 15px;">
            <div>
                <h4 style="margin-bottom: 5px;">${link.title || link.short_code} ${isStatic ? '<span style="font-size: 10px; background: #eee; padding: 2px 4px; border-radius: 4px; margin-left: 6px;">Static</span>' : ''}</h4>
                <p style="font-size: 14px; opacity: 0.6;">${link.original_url.substring(0, 50)}...</p>
            </div>
            <div class="flex">
                ${!isStatic ? `
                    <a href="edit.html?id=${link.id}" class="btn btn-outline" style="padding: 8px 16px; margin-right: 8px;">Edit</a>
                    <a href="analytics.html?id=${link.id}" class="btn btn-primary" style="padding: 8px 16px;">View Stats</a>
                ` : `
                    <button class="btn btn-primary" style="padding: 8px 16px;" onclick="window.location.href='links.html'">View QR</button>
                `}
            </div>
        </div>
        `
    }).join("");
}
