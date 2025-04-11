document.addEventListener('DOMContentLoaded', function () {
  const map = L.map('map').setView([49.8397, 24.0297], 14);
  let routeControl;

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

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

  function fetchFilteredPlaces(startLat, startLng) {
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
        if (!data.length) {
          alert("Немає доступних точок для маршруту");
          return;
        }

        const firstPlace = data[0];
        const endLatLng = L.latLng(firstPlace.latitude, firstPlace.longitude);

        if (routeControl) {
          map.removeControl(routeControl);
        }

        routeControl = L.Routing.control({
          waypoints: [
            L.latLng(startLat, startLng),
            endLatLng
          ],
          routeWhileDragging: false
        }).addTo(map);

        L.marker(endLatLng).addTo(map).bindPopup(firstPlace.name).openPopup();
      });
  }

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(pos => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;

      L.marker([lat, lng], { title: "Ви тут" }).addTo(map);
      map.setView([lat, lng], 15);

      fetchFilteredPlaces(lat, lng);
    });
  }

  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.classList.toggle('active');
      navigator.geolocation.getCurrentPosition(pos => {
        fetchFilteredPlaces(pos.coords.latitude, pos.coords.longitude);
      });
    });
  });
});
