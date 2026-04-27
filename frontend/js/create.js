function toggleQrMode() {
    const isDynamic = document.getElementById('checkDynamic').checked;
    const isStatic = document.getElementById('checkStatic').checked;
    
    document.getElementById('generateBtn').disabled = (!isDynamic && !isStatic);
    
    if (isDynamic) {
        document.getElementById('dynamicConfigTitle').style.display = 'block';
        document.getElementById('dynamicConfigContainer').style.display = 'block';
        document.getElementById('title').setAttribute('required', 'true');
    } else {
        document.getElementById('dynamicConfigTitle').style.display = 'none';
        document.getElementById('dynamicConfigContainer').style.display = 'none';
        document.getElementById('title').removeAttribute('required');
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
    
    const isDynamic = document.getElementById('checkDynamic').checked;
    const isStatic = document.getElementById('checkStatic').checked;
    const originalUrl = document.getElementById("originalUrl").value;
    
    document.getElementById("generateBtn").innerText = "Generating...";
    document.getElementById("generateBtn").disabled = true;

    let staticResult = null;
    let dynamicResult = null;
    const errors = [];

    // --- Generate Static QR (independent try/catch) ---
    if (isStatic) {
        try {
            const title = document.getElementById("title").value || "Static QR";
            staticResult = await api.links.generateStatic(originalUrl, title);
        } catch (err) {
            console.error("Static QR generation failed:", err);
            errors.push("Static QR: " + err.message);
        }
    }

    // --- Generate Dynamic QR (independent try/catch) ---
    if (isDynamic) {
        try {
            const payload = {
                title: document.getElementById("title").value,
                original_url: originalUrl,
                max_scans: parseInt(document.getElementById("maxScans").value) || -1,
                expires_at: document.getElementById("expiresAt").value || null,
                rules: [],
                ab_test: null
            };

            document.querySelectorAll(".rule-item").forEach(item => {
                payload.rules.push({
                    rule_type: item.querySelector(".rule-type").value,
                    rule_value: item.querySelector(".rule-value").value,
                    target_url: item.querySelector(".rule-target").value,
                    priority: 0
                });
            });

            const urlA = document.getElementById("urlA").value;
            const urlB = document.getElementById("urlB").value;
            if (urlA && urlB) {
                payload.ab_test = { url_a: urlA, url_b: urlB, ratio_a: 0.5, ratio_b: 0.5 };
            }

            const linkData = await api.links.create(payload);
            dynamicResult = await api.links.getQR(linkData.id);
        } catch (err) {
            console.error("Dynamic QR generation failed:", err);
            errors.push("Dynamic QR: " + err.message);
        }
    }

    // --- Display results ---
    const hasAnyResult = staticResult || dynamicResult;

    if (hasAnyResult) {
        document.getElementById("createLinkForm").parentElement.style.display = 'none';
        document.getElementById("resultSection").style.display = 'block';

        if (staticResult) {
            const qrSrc = staticResult.qr_code.startsWith("data:") ? staticResult.qr_code : "data:image/png;base64," + staticResult.qr_code;
            document.getElementById("staticQrImage").src = qrSrc;
            document.getElementById("downloadStaticQr").href = qrSrc;
            document.getElementById("staticResult").style.display = 'block';
        }

        if (dynamicResult) {
            const qrSrc = dynamicResult.qr_code.startsWith("data:") ? dynamicResult.qr_code : "data:image/png;base64," + dynamicResult.qr_code;
            document.getElementById("dynamicQrImage").src = qrSrc;
            document.getElementById("downloadDynamicQr").href = qrSrc;
            document.getElementById("dynamicResult").style.display = 'block';
        }

        // Show partial errors if one succeeded and the other failed
        if (errors.length > 0) {
            alert("Some QR codes failed to generate:\n" + errors.join("\n"));
        }
    } else {
        // Both failed
        alert("Failed to generate QR codes:\n" + errors.join("\n"));
        document.getElementById("generateBtn").innerText = "Generate QR";
        document.getElementById("generateBtn").disabled = false;
    }
});
