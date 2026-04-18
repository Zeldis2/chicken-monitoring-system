let historyData = [];

document.addEventListener("DOMContentLoaded", function() {
    loadHistory();
    setInterval(loadHistory, 5000); 
    document.getElementById("downloadBtn").addEventListener("click", downloadExcel);
});

function loadHistory() {
    const tableBody = document.getElementById("recordsBody");
    
    fetch("api/get_history.php?t=" + new Date().getTime()) 
        .then(response => response.json())
        .then(data => {
            historyData = data; 
            tableBody.innerHTML = ""; 

            if (!data || data.length === 0) {
                tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center;">No records found.</td></tr>`;
                return;
            }

            data.forEach(item => {
                let finalTime = item.display_date || "Time Error";
                let status = item.health_status || "Unknown";
                let typeDisplay = item.detection_type || "Unknown";
                
                let statusClass = "status-healthy";
                let rowBg = "";
                if(status === "Critical" || status === "Problem Detected") {
                    statusClass = "status-critical";
                    rowBg = "rgba(255, 0, 0, 0.05)";
                } else if(status === "Warning") {
                    statusClass = "status-warning";
                }

                const row = `
                    <tr style="background:${rowBg}">
                        <td style="font-weight:bold; color:#555;">${finalTime}</td>
                        <td><span class="type-badge">${typeDisplay}</span></td>
                        <td>${item.zone || '-'}</td>
                        <td class="${statusClass}">${status}</td>
                        <td>${item.symptoms || '-'}</td>
                        <td>${item.remarks || '-'}</td>
                    </tr>
                `;
                tableBody.innerHTML += row;
            });
        })
        .catch(err => console.error(err));
}

function downloadExcel() {
    if (historyData.length === 0) {
        alert("No data to export!");
        return;
    }

    const formattedData = historyData.map(item => ({
        "Date & Time": item.display_date || "",
        "Type": item.detection_type || "",
        "Zone": item.zone || "",
        "Health Status": item.health_status || "",
        "Symptoms": item.symptoms || "",
        "Remarks": item.remarks || ""
    }));

    const worksheet = XLSX.utils.json_to_sheet(formattedData);

    const columnWidths = [
        { wch: 25 }, 
        { wch: 10 }, 
        { wch: 10 }, 
        { wch: 15 }, 
        { wch: 25 }, 
        { wch: 40 }  
    ];
    worksheet['!cols'] = columnWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Farm_History");

    let today = new Date();
    let dateStr = today.toISOString().split('T')[0]; 
    let fileName = `Chickenarium_Report_${dateStr}.xlsx`;

    XLSX.writeFile(workbook, fileName);
}