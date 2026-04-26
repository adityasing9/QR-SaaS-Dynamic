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

    document.getElementById("linkTitle").innerText = link.title || link.short_code;
    document.getElementById("linkUrl").innerText = link.original_url;
    document.getElementById("totalScans").innerText = data.total_scans;
    document.getElementById("uniqueVisitors").innerText = data.unique_visitors;

    // Device Chart
    const devices = data.scans_by_device;
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
    const countries = data.scans_by_country;
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
    const timeline = data.scans_over_time;
    new Chart(document.getElementById("scansChart"), {
        type: 'line',
        data: {
            labels: timeline.map(t => t.date),
            datasets: [{
                label: 'Daily Scans',
                data: timeline.map(t => t.count),
                borderColor: '#d4af37',
                tension: 0.3,
                fill: true,
                backgroundColor: 'rgba(212, 175, 55, 0.1)'
            }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });
}
