document.addEventListener('DOMContentLoaded', function () {
  const map = L.map('map').setView([49.8397, 24.0297], 14);
  let start = null;
  let end = null;
  let routeControl = null;
  let markers = [];

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  function toRad(x) {
    return x * Math.PI / 180;
  }

  function haversine(lat1, lon1, lat2, lon2) {
    const R = 6371000;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) ** 2 +
              Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
              Math.sin(dLon / 2) ** 2;
    return 2 * R * Math.sqrt(a);
  }

  function pointToLineDistance(A, B, P) {
    const [x1, y1] = A;
    const [x2, y2] = B;
    const [x0, y0] = P;

    const dx = x2 - x1;
    const dy = y2 - y1;
    const t = ((x0 - x1) * dx + (y0 - y1) * dy) / (dx * dx + dy * dy);
    const clampedT = Math.max(0, Math.min(1, t));
    const nearest = [x1 + clampedT * dx, y1 + clampedT * dy];
    return haversine(x0, y0, nearest[0], nearest[1]);
  }

  function getActiveFilters() {
    const filters = {};
    document.querySelectorAll('.filter-btn.active').forEach(btn => {
      const text = btn.textContent.trim().toUpperCase();
      if (text === 'WHEELCHAIR ACCESSIBLE') filters.wheelchair_accessible = true;
      if (text === 'EASY ENTRANCE') filters.easy_entrance = true;
      if (text === 'VISION IMPAIRMENT') filters.has_tactile_elements = true;
      if (text === 'TACTILE ELEMENT') filters.has_tactile_elements = true;
      if (text === 'ACCESSIBLE TOILET') filters.accessible_toilet = true;
      if (text === 'HAS RAMP') filters.has_ramp = true;
    });
    return filters;
  }

  window.removeMarker = function (btn) {
    const popupContent = btn.closest('.leaflet-popup-content');
    const text = popupContent.innerText.split('🗑')[0].trim();

    const markerToRemove = markers.find(marker =>
      marker.getPopup().getContent().includes(text)
    );
    if (markerToRemove) {
      map.removeLayer(markerToRemove);
      markers = markers.filter(m => m !== markerToRemove);
    }
  };

  window.removeStart = function () {
    markers = markers.filter(m => {
      if (m.getLatLng().lat === start.lat && m.getLatLng().lng === start.lng) {
        map.removeLayer(m);
        return false;
      }
      return true;
    });
    start = null;
    if (routeControl) map.removeControl(routeControl);
    clearRoutePanels();
  };

  window.removeEnd = function () {
    markers = markers.filter(m => {
      if (m.getLatLng().lat === end.lat && m.getLatLng().lng === end.lng) {
        map.removeLayer(m);
        return false;
      }
      return true;
    });
    end = null;
    if (routeControl) map.removeControl(routeControl);
    clearRoutePanels();
  };

  function clearRoutePanels() {
    document.getElementById('route-instructions').innerHTML = '';
    document.getElementById('route-places-details').innerHTML = '';
  }

  function displayMarkers(data) {
    markers.forEach(m => map.removeLayer(m));
    markers = [];

    data.forEach(place => {
      const marker = L.marker([place.latitude, place.longitude]).addTo(map);
      marker.bindPopup(`
        <strong>${place.name}</strong><br>
        ${place.address}<br>
        ⭐ ${place.rating || 'N/A'} (${place.reviews || 0} reviews)<br>
        <button onclick="removeMarker(this)">🗑 Видалити</button>
      `);
      markers.push(marker);
    });
  }

  function buildRoute() {
    if (!start || !end) return;

    const filters = getActiveFilters();
    fetch('/filter-places/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value
      },
      body: JSON.stringify(filters)
    })
    .then(res => res.json())
    .then(data => {
      const filtered = [];

      data.forEach(place => {
        const dist = pointToLineDistance(
          [start.lat, start.lng],
          [end.lat, end.lng],
          [place.latitude, place.longitude]
        );
<<<<<<< HEAD
        if (dist <= 400) filtered.push(place);
=======
        if (dist <= 200) filtered.push(place);
>>>>>>> roman
      });

      const points = filtered.slice(0, 5);
      const waypoints = [L.latLng(start.lat, start.lng)];
      points.forEach(p => waypoints.push(L.latLng(p.latitude, p.longitude)));
      waypoints.push(L.latLng(end.lat, end.lng));

      if (routeControl) map.removeControl(routeControl);

      routeControl = L.Routing.control({
        waypoints: waypoints,
        routeWhileDragging: false,
        createMarker: () => null
      }).on('routesfound', function (e) {
        const summary = e.routes[0].summary;
        const instructions = e.routes[0].instructions;

        document.getElementById('route-instructions').innerHTML = `
          <strong>Маршрут: ${(summary.totalDistance/1000).toFixed(2)} км, ~${(summary.totalTime/60).toFixed(0)} хв</strong>
          <ol>${instructions.map(i => `<li>${i.text}</li>`).join('')}</ol>
        `;

        document.getElementById('route-places-details').innerHTML = `
          <h4>Місця вздовж маршруту:</h4>
          ${points.map(p => `
            <div class="place-detail">
              <strong>${p.name}</strong><br>
              ${p.address}<br>
              ⭐ ${p.rating || 'N/A'} (${p.reviews || 0} відгуків)
            </div>
          `).join('')}
        `;
      }).addTo(map);
    });
  }

  function fetchFilteredPlaces() {
    const filters = getActiveFilters();
    fetch('/filter-places/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value
      },
      body: JSON.stringify(filters)
    })
    .then(res => res.json())
    .then(data => displayMarkers(data));
  }

  map.on('click', function (e) {
    if (!start) {
      start = e.latlng;
      const m = L.marker(start).addTo(map);
      m.bindPopup(`
        <strong>Початок</strong><br>
        <button onclick="removeStart()">🗑 Видалити</button>
      `).openPopup();
      markers.push(m);
    } else if (!end) {
      end = e.latlng;
      const m = L.marker(end).addTo(map);
      m.bindPopup(`
        <strong>Кінець</strong><br>
        <button onclick="removeEnd()">🗑 Видалити</button>
      `).openPopup();
      markers.push(m);
      buildRoute();
    }
  });

  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.classList.toggle('active');
      fetchFilteredPlaces();
    });
  });

  fetchFilteredPlaces();
});
