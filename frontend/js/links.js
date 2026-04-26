document.addEventListener("DOMContentLoaded", async () => {
    loadLinks();
});

async function loadLinks() {
    const list = document.getElementById("linksList");
    try {
        const links = await api.links.getAll();
        if (links.length === 0) {
            list.innerHTML = `<div class="card text-center"><p>No links found.</p></div>`;
            return;
        }

        list.innerHTML = links.map(link => `
            <div class="card flex justify-between" style="margin-bottom: 20px;">
                <div style="flex: 1">
                    <h3>${link.title || link.short_code}</h3>
                    <p style="font-size: 14px; opacity: 0.7;">Dest: ${link.original_url}</p>
                    <p style="font-size: 12px; margin-top: 5px; color: var(--primary)">/r/${link.short_code}</p>
                </div>
                <div class="flex">
                    <button class="btn btn-outline" onclick="showQR(${link.id})">Show QR</button>
                    <a href="analytics.html?id=${link.id}" class="btn btn-secondary">Stats</a>
                    <button class="btn btn-outline" style="color: red; border-color: red;" onclick="deleteLink(${link.id})">Delete</button>
                </div>
            </div>
        `).join("");
    } catch (error) {
        alert(error.message);
    }
}

async function showQR(id) {
    try {
        const res = await api.links.getQR(id);
        const container = document.getElementById("qrContainer");
        container.innerHTML = `<img src="${res.qr_code}" alt="QR Code" style="max-width: 250px; border-radius: 12px;">`;
        document.getElementById("qrModal").style.display = "flex";
    } catch (error) {
        alert(error.message);
    }
}

async function deleteLink(id) {
    if (confirm("Are you sure you want to delete this link?")) {
        try {
            await api.links.delete(id);
            loadLinks();
        } catch (error) {
            alert(error.message);
        }
    }
}
