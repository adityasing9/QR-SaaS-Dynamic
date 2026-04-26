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

    list.innerHTML = links.slice(0, 5).map(link => `
        <div class="card flex justify-between" style="margin-bottom: 15px;">
            <div>
                <h4 style="margin-bottom: 5px;">${link.title || link.short_code}</h4>
                <p style="font-size: 14px; opacity: 0.6;">${link.original_url.substring(0, 50)}...</p>
            </div>
            <div class="flex">
                <span class="btn btn-outline" style="padding: 5px 12px;">${link.current_scans} scans</span>
                <a href="analytics.html?id=${link.id}" class="btn btn-primary" style="padding: 8px 16px;">View Stats</a>
            </div>
        </div>
    `).join("");
}
