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

        list.innerHTML = links.map(link => {
            const isStatic = link.short_code.startsWith('ST_');
            return `
            <div class="card flex justify-between" style="margin-bottom: 20px;">
                <div style="flex: 1">
                    <h3>${link.title || link.short_code} ${isStatic ? '<span style="font-size: 12px; background: #eee; padding: 2px 6px; border-radius: 4px; margin-left: 8px;">Static</span>' : ''}</h3>
                    <p style="font-size: 14px; opacity: 0.7;">Dest: ${link.original_url}</p>
                    ${!isStatic ? `<p style="font-size: 12px; margin-top: 5px; color: var(--primary)">/r/${link.short_code}</p>` : ''}
                </div>
                <div class="flex">
                    <button class="btn btn-primary" style="margin-right: 8px;" onclick="showQR(${link.id})">View QR</button>
                    ${!isStatic ? `
                        <a href="edit.html?id=${link.id}" class="btn btn-outline" style="margin-right: 8px;">Edit</a>
                        <a href="analytics.html?id=${link.id}" class="btn btn-outline" style="margin-right: 8px;">Stats</a>
                    ` : ''}
                    <button class="btn btn-outline" style="color: #ff4d4d; border-color: #ff4d4d;" onclick="deleteLink(${link.id})">Delete</button>
                </div>
            </div>
            `
        }).join("");
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
