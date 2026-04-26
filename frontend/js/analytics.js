document.addEventListener("DOMContentLoaded", async () => {
    if (!localStorage.getItem("token")) {
        window.location.href = "index.html";
        return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const linkId = urlParams.get("id");

    if (!linkId) {
        window.location.href = "dashboard.html";
        return;
    }

    const logoutBtn = document.getElementById("logoutBtn");
    logoutBtn?.addEventListener("click", () => api.auth.logout());

    try {
        const stats = await api.analytics.get(linkId);
        renderAnalytics(stats);
    } catch (error) {
        console.error(error);
        alert("Failed to load analytics");
    }
});

function renderAnalytics(data) {
    const link = data.link;
    const visits = data.visits;

    document.getElementById("linkTitle").innerText = link.title || link.short_code;
    document.getElementById("linkUrl").innerText = link.original_url;
    document.getElementById("totalScans").innerText = link.current_scans;
    
    const uniqueVisitors = new Set(visits.map(v => v.visitor_id)).size;
    document.getElementById("uniqueVisitors").innerText = uniqueVisitors;

    // Device Chart
    const devices = {};
    visits.forEach(v => devices[v.device] = (devices[v.device] || 0) + 1);
    
    new Chart(document.getElementById("deviceChart"), {
        type: 'doughnut',
        data: {
            labels: Object.keys(devices),
            datasets: [{
                data: Object.values(devices),
                backgroundColor: ['#d4af37', '#1a1a1a', '#333']
            }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });

    // Country Chart
    const countries = {};
    visits.forEach(v => countries[v.country] = (countries[v.country] || 0) + 1);
    
    const topCountry = Object.entries(countries).sort((a,b) => b[1]-a[1])[0];
    document.getElementById("topCountry").innerText = topCountry ? topCountry[0] : "-";

    new Chart(document.getElementById("countryChart"), {
        type: 'bar',
        data: {
            labels: Object.keys(countries),
            datasets: [{
                label: 'Scans',
                data: Object.values(countries),
                backgroundColor: '#d4af37'
            }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });

    // Scans Over Time
    const timeline = {};
    visits.forEach(v => {
        const date = new Date(v.timestamp).toLocaleDateString();
        timeline[date] = (timeline[date] || 0) + 1;
    });

    new Chart(document.getElementById("scansChart"), {
        type: 'line',
        data: {
            labels: Object.keys(timeline),
            datasets: [{
                label: 'Daily Scans',
                data: Object.values(timeline),
                borderColor: '#d4af37',
                tension: 0.3,
                fill: true,
                backgroundColor: 'rgba(212, 175, 55, 0.1)'
            }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });
}
