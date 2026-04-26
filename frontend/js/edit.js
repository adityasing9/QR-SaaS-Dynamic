document.addEventListener("DOMContentLoaded", async () => {
    if (!localStorage.getItem("token")) {
        window.location.href = "index.html";
        return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const linkId = urlParams.get("id");

    if (!linkId) {
        window.location.href = "links.html";
        return;
    }

    const form = document.getElementById("editLinkForm");
    const rulesList = document.getElementById("rulesList");
    const addRuleBtn = document.getElementById("addRuleBtn");

    let currentLink = null;

    // Load current data
    try {
        currentLink = await api.links.getOne(linkId);
        document.getElementById("title").value = currentLink.title;
        document.getElementById("original_url").value = currentLink.original_url;
        document.getElementById("max_scans").value = currentLink.max_scans;

        currentLink.rules.forEach(rule => addRuleRow(rule));
    } catch (error) {
        alert("Failed to load link data");
        window.location.href = "links.html";
    }

    function addRuleRow(rule = {}) {
        const div = document.createElement("div");
        div.className = "rule-row card mt-20";
        div.style.background = "rgba(255,255,255,0.02)";
        div.innerHTML = `
            <div class="grid-2">
                <div class="form-group">
                    <label>If Type</label>
                    <select class="rule-type">
                        <option value="device" ${rule.rule_type === 'device' ? 'selected' : ''}>Device</option>
                        <option value="country" ${rule.rule_type === 'country' ? 'selected' : ''}>Country</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Is Value</label>
                    <input type="text" class="rule-value" placeholder="e.g. Mobile" value="${rule.rule_value || ''}">
                </div>
            </div>
            <div class="form-group">
                <label>Then Redirect To</label>
                <input type="url" class="rule-url" placeholder="https://..." value="${rule.target_url || ''}">
            </div>
            <button type="button" class="btn btn-outline" style="color: #ff4d4d; border-color: #ff4d4d;" onclick="this.parentElement.remove()">Remove</button>
        `;
        rulesList.appendChild(div);
    }

    addRuleBtn.addEventListener("click", () => addRuleRow());

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        const rules = [];
        document.querySelectorAll(".rule-row").forEach(row => {
            rules.push({
                rule_type: row.querySelector(".rule-type").value,
                rule_value: row.querySelector(".rule-value").value,
                target_url: row.querySelector(".rule-url").value
            });
        });

        const data = {
            title: document.getElementById("title").value,
            original_url: document.getElementById("original_url").value,
            max_scans: parseInt(document.getElementById("max_scans").value),
            rules: rules,
            ab_test: null // Simplification for now
        };

        try {
            await api.links.update(linkId, data);
            alert("Link updated successfully!");
            window.location.href = "links.html";
        } catch (error) {
            alert(error.message);
        }
    });
});
