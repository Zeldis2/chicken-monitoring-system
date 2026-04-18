document.addEventListener("DOMContentLoaded", function() {
    const menuBtn = document.getElementById("menuBtn");
    if(menuBtn) {
        menuBtn.addEventListener("click", () => {
            document.getElementById("siteNav").classList.toggle("open");
        });
    }
    updateMonitoring();
    setInterval(updateMonitoring, 2000);
});

function updateMonitoring() {
    fetch("api/get_monitoring.php?t=" + new Date().getTime())
        .then(res => res.json())
        .then(data => {
            // I-update ang table at webpage grid
            renderTable(data);
            updateGrid(data);

            // 🔥 BAGONG DAGDAG: I-send ang database records sa Python Camera Server!
            fetch("https://live.chickenmonitoring.online/update_alerts", {
                method: "POST",
                body: JSON.stringify(data),
                headers: { "Content-Type": "application/json" }
            })
            .then(response => console.log("Camera grid updated!"))
            .catch(err => console.log("Camera server offline:", err));
        })
        .catch(err => console.error("Connection Error:", err));
}

function renderTable(data) {
    const body = document.getElementById("monitoringBody");
    body.innerHTML = "";

    if (!data || data.length === 0) {
        body.innerHTML = `<tr><td colspan="5" style="text-align:center;color:#888; padding:20px;">No recent detections.</td></tr>`;
        return;
    }

    data.forEach(e => {
        let statusClass = "text-healthy";
        let status = e.health_status || "Unknown";

        if (status === "Critical" || status === "Problem Detected") {
            statusClass = "text-critical";
        } else if (status === "Warning") {
            statusClass = "text-warning";
        }

        let timeDisplay = e.short_time || "Just Now";
        
        // DITO NATIN KUKUNIN YUNG VISUAL / VOCAL
        let typeDisplay = e.detection_type || "Unknown";

        // 5 COLUMNS DAPAT ITO KAYA MAY 5 NA <td>
        body.innerHTML += `
            <tr>
              <td>${timeDisplay}</td>
              <td><span class="type-badge" style="padding: 3px 8px; border-radius: 12px; font-size: 0.8rem; background: #eee; color: #333; font-weight: bold;">${typeDisplay}</span></td>
              <td style="font-weight: bold;">${e.zone || '-'}</td>
              <td class="${statusClass}">${status}</td>
              <td>${e.remarks || ''}</td>
            </tr>`;
    });
}

function updateGrid(data) {
    document.querySelectorAll(".zone").forEach(z => {
        z.className = "zone"; 
    });

    if (!data || data.length === 0) {
        updateBanner("Healthy");
        return;
    }

    let zoneStatusMap = {};
    let globalWorstStatus = 0; 

    data.forEach(item => {
        let severity = 0;
        if (item.health_status === "Warning") severity = 1;
        if (item.health_status === "Critical" || item.health_status === "Problem Detected") severity = 2;

        if (severity > globalWorstStatus) globalWorstStatus = severity;

        let zones = [];
        if (item.zone && item.zone.includes("-")) {
            zones = item.zone.split("-");
        } else if (item.zone) {
            zones = [item.zone];
        }

        zones.forEach(zID => {
            if (!zoneStatusMap[zID] || severity > zoneStatusMap[zID]) {
                zoneStatusMap[zID] = severity;
            }
        });
    });

    for (const [zoneID, severity] of Object.entries(zoneStatusMap)) {
        const el = document.getElementById(zoneID);
        if (el) {
            if (severity === 2) {
                el.classList.add("active-critical"); 
            } else if (severity === 1) {
                el.classList.add("active-warning"); 
            }
        }
    }
    updateBanner(globalWorstStatus);
}

function updateBanner(severityLevel) {
    const farmStatus = document.getElementById("farmStatus");
    if (severityLevel === 2) {
        farmStatus.textContent = "🚨 ALARM: CRITICAL ISSUE DETECTED!";
        farmStatus.className = "status-banner critical";
    } else if (severityLevel === 1) {
        farmStatus.textContent = "⚠️ WARNING: Abnormal Activity Detected";
        farmStatus.className = "status-banner warning";
    } else {
        farmStatus.textContent = "✅ Farm Status: Healthy";
        farmStatus.className = "status-banner";
    }
}