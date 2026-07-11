document.addEventListener('DOMContentLoaded', function () {
  var el = document.getElementById('locationsMap');
  if (!el || typeof L === 'undefined') return;

  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
  });

  var locations = [
    { name: 'OŠ "Vuk Karadžić"', address: 'Vojvode Stepe 4, Bijeljina', lat: 44.75894, lng: 19.22345 },
    { name: 'OŠ "Jovan Dučić"', address: 'Srpske vojske 104, Bijeljina', lat: 44.74726, lng: 19.22130 },
    { name: 'JU OŠ "Dvorovi"', address: 'Karađorđeva 101, Dvorovi', lat: 44.80532, lng: 19.25866 }
  ];

  var map = L.map(el);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> saradnici',
    maxZoom: 19
  }).addTo(map);

  var markers = locations.map(function (loc) {
    return L.marker([loc.lat, loc.lng])
      .addTo(map)
      .bindPopup('<strong>' + loc.name + '</strong><br>' + loc.address);
  });

  var group = L.featureGroup(markers);
  map.fitBounds(group.getBounds(), { padding: [30, 30] });
});
