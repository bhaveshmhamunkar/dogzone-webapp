console.log("Script loaded successfully");

// Section toggle logic
function showSection(sectionId) {
    document.getElementById("homeScreen").classList.add("hidden");
    document.getElementById("viewZonesSection").classList.add("hidden");
    document.getElementById("reportSection").classList.add("hidden");

    document.getElementById(sectionId).classList.remove("hidden");
}

function goHome() {
    showSection("homeScreen");
}

// Initialize Dog Zone Map
let dogZoneMap; // Declare globally

function initializeDogZoneMap() {
    // Only initialize once
    if (!dogZoneMap) {
        dogZoneMap = L.map('dogZoneMap').setView([19.0760, 72.8777], 12);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(dogZoneMap);
    }

    // Clear old markers before adding new ones
    dogZoneMap.eachLayer(function (layer) {
        if (layer instanceof L.Marker) {
            dogZoneMap.removeLayer(layer);
        }
    });

    // Load data from API
    fetch("http://127.0.0.1:8000/api/reports/")
        .then(response => response.json())
        .then(data => {
            data.forEach(report => {
                if (report.latitude && report.longitude) {
                    const marker = L.marker([report.latitude, report.longitude]).addTo(dogZoneMap);
                    marker.bindPopup(`
    <b>${report.name}</b><br>
    ${report.description}<br>
    ${report.location}<br>
    ${report.photo ? `<img src="${report.photo}" alt="Reported Image" style="width: 100%; max-width: 200px; margin-top: 5px;">` : ''}
`);

                }
                 // Add to list (only in View Zones tab)
                const div = document.createElement("div");
div.innerHTML = `
    <p><strong>${report.name}</strong> (${report.date_time})<br>
    ${report.location} - ${report.description}</p>
    ${report.photo ? `<img src="${report.photo}" alt="Reported Image" width="200">` : ''}
    <hr>`;
document.getElementById("reportList").appendChild(div);
            });
        })
        .catch(error => {
            console.error("Error loading dog zone markers:", error);
        });

    // Refresh map layout (important!)
    setTimeout(() => {
        dogZoneMap.invalidateSize();
    }, 100);
}


// Load reports and add markers
function loadReports() {
    fetch("http://127.0.0.1:8000/api/reports/")
        .then((response) => response.json())
        .then((data) => {
            // Only update markers on map, don't update any list in report section
            data.forEach((report) => {
                if (report.latitude && report.longitude) {
                    const marker = L.marker([report.latitude, report.longitude]).addTo(dogZoneMap);
                    marker.bindPopup(`
                        <b>${report.name}</b><br>
                        ${report.description}<br>
                        ${report.location}<br>
                        ${report.photo ? `<img src="${report.photo}" alt="Reported Image" style="width: 100%; max-width: 200px; margin-top: 5px;">` : ''}
                    `);

                }
            });
        })
        .catch((error) => {
            console.error("Error loading reports:", error);
        });
}


// Initialize report map and click location selection
let reportMap;
let marker;

function initializeReportMap() {
    if (reportMap) return; // Don't reinitialize

    reportMap = L.map('reportMapContainer').setView([19.0760, 72.8777], 12);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(reportMap);

    

    reportMap.on('click', function (e) {
        const { lat, lng } = e.latlng;
        document.getElementById('latitude').value = lat.toFixed(6);
        document.getElementById('longitude').value = lng.toFixed(6);

        if (marker) {
            marker.setLatLng(e.latlng);
        } else {
            marker = L.marker(e.latlng).addTo(reportMap);
        }
    });
}


// Handle report form submission
document.getElementById("reportForm").addEventListener("submit", function (e) {
    e.preventDefault();

    const form = this;  // preserve reference to form
    const formData = new FormData(form);

    fetch("http://127.0.0.1:8000/api/reports/", {
        method: "POST",
        body: formData
    })
    .then((response) => {
        if (!response.ok) {
            throw new Error("Submission failed");
        }
        return response.json();
    })
    .then((data) => {
        alert("Report submitted successfully!");

        form.reset(); // now works safely
        if (marker) {
            marker.remove();
            marker = null;
        }
       
    })
    .catch((error) => {
        console.error("Submission error:", error);
        alert("An error occurred while submitting the report.");
    });
});




function showSection(sectionId) {
    // Hide all
    document.getElementById("homeScreen").classList.add("hidden");
    document.getElementById("viewZonesSection").classList.add("hidden");
    document.getElementById("reportSection").classList.add("hidden");

    // Show selected section
    document.getElementById(sectionId).classList.remove("hidden");

    // Initialize map in View Zones tab
    if (sectionId === "viewZonesSection") {
        initializeDogZoneMap();
    }

    // Initialize map in Report tab
    if (sectionId === "reportSection") {
        setTimeout(() => {
            initializeReportMap();
            reportMap.invalidateSize();
        }, 100);
    }
}

