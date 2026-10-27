// 1. Define your stores
const stores = [
  { name: "Downtown Branch", lat: 40.7128, lon: -74.0060 }, 
  { name: "Uptown Branch", lat: 40.7831, lon: -73.9712 },
  { name: "Brooklyn Branch", lat: 40.6782, lon: -73.9442 }
];

// 2. Map global variables
let map = null;
let userMarker = null;
let storeMarker = null;

// 3. Define custom icons (using public icon assets)
const userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const storeIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// 4. Haversine distance formula
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km (change to 3958.8 for miles)
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
            
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; 
}

// 5. Setup the click event
document.getElementById('find-btn').addEventListener('click', () => {
  const statusText = document.getElementById('status-text');
  
  if (!navigator.geolocation) {
    statusText.textContent = "Geolocation is not supported by your browser.";
    return;
  }

  statusText.textContent = "Requesting location permission...";
  
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const userLat = position.coords.latitude;
      const userLon = position.coords.longitude;
      statusText.textContent = ""; // Clear status
      
      findNearestStore(userLat, userLon);
    },
    (error) => {
      statusText.textContent = "Unable to retrieve your location. Please ensure location services are enabled.";
    }
  );
});

// 6. Calculate nearest and draw map
function findNearestStore(userLat, userLon) {
  let nearestStore = null;
  let shortestDistance = Infinity;

  // Find the closest store
  stores.forEach(store => {
    const distance = calculateDistance(userLat, userLon, store.lat, store.lon);
    if (distance < shortestDistance) {
      shortestDistance = distance;
      nearestStore = store;
    }
  });

  // Display text result
  const resultDiv = document.getElementById('store-result');
  resultDiv.innerHTML = `
    <h3>Closest Location: <span style="color: #d32f2f;">${nearestStore.name}</span></h3>
    <p>Distance: <strong>${shortestDistance.toFixed(2)} km</strong> away</p>
  `;

  // Reveal the map container
  document.getElementById('map').style.display = 'block';

  // Initialize the map only once
  if (!map) {
    map = L.map('map');
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);
  }

  // Remove existing markers if button is clicked multiple times
  if (userMarker) map.removeLayer(userMarker);
  if (storeMarker) map.removeLayer(storeMarker);

  // Plot User Marker (Blue)
  userMarker = L.marker([userLat, userLon], { icon: userIcon })
    .addTo(map)
    .bindPopup("<b>You are here</b>")
    .openPopup();

  // Plot Nearest Store Marker (Red)
  storeMarker = L.marker([nearestStore.lat, nearestStore.lon], { icon: storeIcon })
    .addTo(map)
    .bindPopup(`<b>${nearestStore.name}</b><br>Nearest location`);

  // Auto-zoom to fit both markers perfectly
  const bounds = L.latLngBounds(
    [userLat, userLon], 
    [nearestStore.lat, nearestStore.lon]
  );
  map.fitBounds(bounds, { padding: [50, 50] }); 
}