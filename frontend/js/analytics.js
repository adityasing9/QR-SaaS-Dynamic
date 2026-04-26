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

    // Country List
    const countries = data.scans_by_country;
    const countryList = document.getElementById("countryList");
    countryList.innerHTML = "";
    
    // Sort by count descending
    const sortedCountries = Object.entries(countries).sort((a,b) => b[1]-a[1]);
    
    if (sortedCountries.length > 0) {
        document.getElementById("topCountry").innerText = sortedCountries[0][0];
        
        sortedCountries.forEach(([country, count]) => {
            const li = document.createElement("li");
            li.style.display = "flex";
            li.style.justifyContent = "space-between";
            li.style.padding = "10px";
            li.style.background = "rgba(0,0,0,0.03)";
            li.style.borderRadius = "8px";
            
            li.innerHTML = `
                <span style="font-weight: 500;">${country}</span>
                <span style="color: var(--color-gold); font-weight: bold;">${count}</span>
            `;
            countryList.appendChild(li);
        });
    } else {
        document.getElementById("topCountry").innerText = "-";
        countryList.innerHTML = "<p style='opacity: 0.5;'>No data yet.</p>";
    }

    // Recent Scans Table
    const recentScansTable = document.getElementById("recentScansTable");
    recentScansTable.innerHTML = "";
    
    if (data.recent_visits && data.recent_visits.length > 0) {
        data.recent_visits.forEach(visit => {
            const tr = document.createElement("tr");
            tr.style.borderBottom = "1px solid rgba(0,0,0,0.05)";
            
            const date = new Date(visit.timestamp);
            
            tr.innerHTML = `
                <td style="padding: 12px 10px; font-size: 0.9em; opacity: 0.8;">${date.toLocaleString()}</td>
                <td style="padding: 12px 10px; font-family: monospace;">${visit.ip}</td>
                <td style="padding: 12px 10px;">${visit.device}</td>
                <td style="padding: 12px 10px; font-weight: 500;">${visit.country}</td>
            `;
            recentScansTable.appendChild(tr);
        });
    } else {
        recentScansTable.innerHTML = "<tr><td colspan='4' style='padding: 20px; text-align: center; opacity: 0.5;'>No detailed scans yet.</td></tr>";
    }

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
