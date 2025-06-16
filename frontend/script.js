console.log("Script loaded successfully");

let reports = []; // Store fetched reports here

function upvoteReport(id) {
    fetch(`http://127.0.0.1:8000/api/reports/${id}/upvote/`, {method:'POST'})
    .then((response) => response.json()) 
    .then((data) => {
        document.getElementById(`upvotes-${id}`).innerHTML = data.upvotes;
    })
    .catch((error) => console.error(error)); 
}

function downvoteReport(id) {
    fetch(`http://127.0.0.1:8000/api/reports/${id}/downvote/`, {method:'POST'})
    .then((response) => response.json()) 
    .then((data) => {
        document.getElementById(`downvotes-${id}`).innerHTML = data.downvotes;
    })
    .catch((error) => console.error(error)); 
}


// Section toggle logic
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

function goHome() {
    showSection("homeScreen");

    // Optional: clear search box
    document.getElementById("searchBox").value = '';
    renderReports(reports);
}

// Initialize Dog Zone Map
let dogZoneMap;

function initializeDogZoneMap() {
    // Only initialize once
    if (dogZoneMap) return;

    dogZoneMap = L.map('dogZoneMap').setView([19.0760, 72.8777], 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(dogZoneMap);
     L.Control.geocoder().addTo(dogZoneMap);
    loadReports();
}

// Get user's current location
function getUserLocation(reports) {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            const userLocation = [position.coords.latitude, position.coords.longitude];
            console.log("User's Location :", userLocation);

            // Find nearest incident
            const { nearest, nearestDistance } = findNearestIncident(userLocation, reports);

            if (nearest) {
                alert(`Nearest incident is ${nearestDistance.toFixed(2)} km away at ${nearest.location}.`);
            } else {
                alert("No incident found.");
            }
        }, (error) => {
            console.error(error);
            alert("Unable to retrieve your location.");
        });
    } else {
        alert("Geolocation is not supported by your browser.");
    }
}

function findNearestIncident(userLocation, reports) {
    let nearest = null;
    let nearestDistance = Infinity;

    reports.forEach((report) => {
        if (report.latitude && report.longitude) {
            const incidentLocation = [report.latitude, report.longitude];
            const distance = calculateDistance(userLocation, incidentLocation);
            if (distance < nearestDistance) {
                nearestDistance = distance;
                nearest = report;
            }
        }
    });

    return { nearest, nearestDistance };
}

// Calculate distance (in km) between two points (lat, lng) using Haversine formula
function calculateDistance([lat1, lng1], [lat2, lng2]) {
    const toRad = (deg) => deg * Math.PI / 180;

    const R = 6371; // Earth's radius in km
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);

    const a = Math.sin(dLat/2) * Math.sin(dLat/2) + 
              Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
              Math.sin(dLng/2) * Math.sin(dLng/2);

    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
}

function showDistanceToNearestIncident(reports) {
    if (reports.length === 0) {
        alert("No reports available.");
        return;
    }

    getUserLocation(reports);
}


// Attach a click event to your "Distance to nearest incident" button:
document.getElementById("distanceToNearestBtn").addEventListener("click", () => {
    showDistanceToNearestIncident(reports);
});


function loadReports(){
    fetch("http://127.0.0.1:8000/api/reports/")
        .then((response) => response.json()) 
        .then((data) => {
            reports = data;

            // Display reports in list
            renderReports(reports);

            // Display markers on map
            reports.forEach((report) => {
                if (report.latitude && report.longitude) {
                    const marker = L.marker([report.latitude, report.longitude]).addTo(dogZoneMap);
                    marker.bindPopup(`
                        <b>${report.name}</b><br>
                        ${report.description}<br>
                        ${report.location}<br>
                         <button onclick='upvoteReport(${report.id})'>👍</button> <span id='upvotes-${report.id}'>${report.upvotes}</span> 
    <button onclick='downvoteReport(${report.id})'>👎</button> <span id='downvotes-${report.id}'>${report.downvotes}</span> 
                        ${report.photo ? `<img src="${report.photo}" alt="Reported Image" style="width: 100%; max-width: 200px; margin-top: 5px;">` : ''}
                    `);
                }
            });
        })
        .catch((error) => {
            console.error("Error loading reports.", error);
        });
}

function renderReports(reportsToRender) {
    const reportList = document.getElementById('reportList');
    reportList.innerHTML = '';
  
    reportsToRender.forEach((report) => {
        reportList.innerHTML += `
      <li>
        <strong>${report.name}</strong> at ${report.location}
        <p>${report.description}</p>
        ${report.photo ? `<img src="${report.photo}" alt="Reported Image" style="width: 100%; max-width: 200px; margin-bottom: 10px;">` : ''} 
      </li>`;
    });
}


function filterReports(){
    const searchTerm = document.getElementById("searchBox").value.toLowerCase();

    const filtered = reports.filter((report) => {
      return (
        report.location.toLowerCase().includes(searchTerm) ||
        report.name.toLowerCase().includes(searchTerm)
      );
    });

    renderReports(filtered);
}

document.getElementById("searchBtn").addEventListener("click", filterReports);


// Handle report form submission
document.getElementById("reportForm").addEventListener("submit", function (e) {
    e.preventDefault();

    const form = this;  // Preserve reference to form
    const formData = new FormData(form);

    fetch("http://127.0.0.1:8000/api/reports/", {
        method: "POST",
        body: formData
    })
    .then((response) => {
        if (!response.ok) {
            throw new Error("Submission failed.");
        }
        return response.json();
    })
    .then((data) => {
        alert("Report submitted successfully!");
        form.reset();

        if (marker) {
            marker.remove();
            marker = null;
        }

        // Reload reports after submission
        loadReports();
    })
    .catch((error) => {
        console.error("Submission error.", error);
        alert("An error occurred while submitting the report.");
    });
});

// Initialize report map for adding new incident
let reportMap;
let marker;

function initializeReportMap() {
    if (reportMap) return; // Don't reinitialize

    reportMap = L.map('reportMapContainer').setView([19.0760, 72.8777], 12);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(reportMap);
    L.Control.geocoder().addTo(reportMap);

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

