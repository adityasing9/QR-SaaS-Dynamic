let rules = [];

function showTab(tabId) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    
    document.querySelector(`[onclick="showTab('${tabId}')"]`).classList.add('active');
    document.getElementById(tabId).classList.add('active');
}

function addRule() {
    const id = Date.now();
    const ruleHtml = `
        <div class="rule-item" id="rule-${id}">
            <div class="flex justify-between">
                <select class="rule-type" style="width: 30%">
                    <option value="country">Country (ISO)</option>
                    <option value="device">Device</option>
                    <option value="time">Time (HH:mm-HH:mm)</option>
                </select>
                <input type="text" class="rule-value" placeholder="Value" style="width: 30%">
                <input type="url" class="rule-target" placeholder="Target URL" style="width: 30%">
                <button type="button" onclick="removeRule(${id})" style="background:none; border:none; cursor:pointer">✕</button>
            </div>
        </div>
    `;
    document.getElementById("rulesList").insertAdjacentHTML('beforeend', ruleHtml);
}

function removeRule(id) {
    document.getElementById(`rule-${id}`).remove();
}

document.getElementById("createLinkForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const payload = {
        title: document.getElementById("title").value,
        original_url: document.getElementById("originalUrl").value,
        max_scans: parseInt(document.getElementById("maxScans").value) || -1,
        expires_at: document.getElementById("expiresAt").value || null,
        rules: [],
        ab_test: null
    };

    // Collect Rules
    document.querySelectorAll(".rule-item").forEach(item => {
        payload.rules.push({
            rule_type: item.querySelector(".rule-type").value,
            rule_value: item.querySelector(".rule-value").value,
            target_url: item.querySelector(".rule-target").value,
            priority: 0
        });
    });

    // Collect AB Test
    const urlA = document.getElementById("urlA").value;
    const urlB = document.getElementById("urlB").value;
    if (urlA && urlB) {
        payload.ab_test = {
            url_a: urlA,
            url_b: urlB,
            ratio_a: 0.5,
            ratio_b: 0.5
        };
    }

    try {
        await api.links.create(payload);
        alert("Link created successfully!");
        window.location.href = "dashboard.html";
    } catch (error) {
        alert(error.message);
    }
});
