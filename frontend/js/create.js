let rules = [];
let currentQrMode = 'dynamic';

function setQrMode(mode) {
    currentQrMode = mode;
    document.getElementById('tabDynamic').classList.toggle('active', mode === 'dynamic');
    document.getElementById('tabStatic').classList.toggle('active', mode === 'static');
    
    if (mode === 'static') {
        document.getElementById('dynamicConfigTitle').style.display = 'none';
        document.getElementById('dynamicConfigContainer').style.display = 'none';
        document.getElementById('generateBtn').innerText = 'Generate Static QR';
        document.getElementById('title').removeAttribute('required');
    } else {
        document.getElementById('dynamicConfigTitle').style.display = 'block';
        document.getElementById('dynamicConfigContainer').style.display = 'block';
        document.getElementById('generateBtn').innerText = 'Generate Dynamic QR';
        document.getElementById('title').setAttribute('required', 'true');
    }
}

function showTab(tabId) {
    document.querySelectorAll('#dynamicConfigContainer .tab').forEach(t => t.classList.remove('active'));
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
    
    const originalUrl = document.getElementById("originalUrl").value;
    
    if (currentQrMode === 'static') {
        try {
            document.getElementById("generateBtn").innerText = "Generating...";
            const data = await api.links.generateStatic(originalUrl);
            
            // Show result
            document.getElementById("createLinkForm").parentElement.style.display = 'none';
            document.getElementById("staticResultSection").style.display = 'block';
            
            const qrSrc = "data:image/png;base64," + data.qr_code;
            document.getElementById("staticQrImage").src = qrSrc;
            document.getElementById("downloadStaticQr").href = qrSrc;
        } catch (error) {
            alert(error.message);
            document.getElementById("generateBtn").innerText = "Generate Static QR";
        }
        return;
    }
    
    // Dynamic Logic
    const payload = {
        title: document.getElementById("title").value,
        original_url: originalUrl,
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
        document.getElementById("generateBtn").innerText = "Saving...";
        await api.links.create(payload);
        window.location.href = "dashboard.html";
    } catch (error) {
        alert(error.message);
        document.getElementById("generateBtn").innerText = "Generate Dynamic QR";
    }
});
