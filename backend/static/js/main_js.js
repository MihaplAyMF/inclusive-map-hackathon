document.addEventListener('DOMContentLoaded', function () {
  const mapContainer = document.getElementById('map');
  if (!mapContainer) return;

  let marker;
  let markers = [];

  const map = L.map('map').setView([49.8397, 24.0297], 16);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  let selectedLat = null;
  let selectedLng = null;

  map.on('click', function (e) {
    const lat = e.latlng.lat;
    const lng = e.latlng.lng;
    selectedLat = lat;
    selectedLng = lng;

    const addBtn = document.getElementById('add-place-btn');
    if (addBtn) addBtn.style.display = 'inline-block';

    if (marker) {
      marker.setLatLng([lat, lng]);
    } else {
      marker = L.marker([lat, lng]).addTo(map);
    }

    fetch('/get-location-info/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lat, lng })
    })
      .then(res => res.json())
      .then(data => {
        const placesDiv = document.getElementById('places');
        if (!placesDiv) return;

        placesDiv.innerHTML = '';
        const max = 4;
        data.slice(0, max).forEach(place => {
          const card = document.createElement('div');
          card.className = 'place-card';
          card.innerHTML = `
            <strong>${place.name}</strong><br>
            ${place.vicinity}<br>
            ⭐ ${place.rating || 'N/A'} (${place.user_ratings_total || 0} reviews)
          `;
          placesDiv.appendChild(card);

          card.addEventListener('click', () => {
            const panel = document.getElementById('details');
            if (!panel) return;

            panel.innerHTML = `
              <h3>Деталі місця: ${place.name}</h3>
              <p>Адреса: ${place.vicinity}</p>
              <p>Рейтинг: ⭐ ${place.rating || 'N/A'} (${place.user_ratings_total || 0} reviews)</p>
              <p>Час роботи: ${place.opening_hours?.weekday_text?.join(', ') || 'Не вказано'}</p>
            `;
          });
        });
      });
  });

  const form = document.getElementById('add-place-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const formData = new FormData(form);
      const csrf = document.querySelector('[name=csrfmiddlewaretoken]').value;

      fetch('/api/add-place/', {
        method: 'POST',
        headers: { 'X-CSRFToken': csrf },
        body: formData
      })
        .then(res => res.json())
        .then(() => {
          document.getElementById('form-status').innerText = 'Місце додано успішно!';
          form.reset();
          setTimeout(window.closeModal, 2000);
          fetchFilteredPlaces();
        })
        .catch(() => {
          document.getElementById('form-status').innerText = 'Помилка під час додавання.';
        });
    });
  }

  function getActiveFilters() {
    const filters = {};
    document.querySelectorAll('.filter-btn.active').forEach(btn => {
      const text = btn.textContent.trim();
      if (text === 'VISION IMPAIRMENT') filters.has_tactile_elements = true;
      if (text === 'WHEELCHAIR ACCESSIBLE') filters.wheelchair_accessible = true;
      if (text === 'TACTILE ELEMENT') filters.has_ramp = true;
      if (text === 'EASY ENTRANCE') filters.easy_entrance = true;
    });
    return filters;
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
      .then(data => {
        markers.forEach(m => map.removeLayer(m));
        markers = [];

        data.forEach(place => {
          const popup = `
            <strong>${place.name}</strong><br>
            ${place.address}<br>
            ⭐ ${place.rating || 'N/A'} (${place.reviews || 0} reviews)
          `;

          const m = L.marker([place.latitude, place.longitude])
            .addTo(map)
            .bindPopup(popup)
            .on('click', () => {
              const panel = document.getElementById('details');
              if (!panel) return;

              panel.innerHTML = `
                <h3>Деталі місця: ${place.name}</h3>
                <p>Адреса: ${place.address}</p>
                <p>Рейтинг: ⭐ ${place.rating || 'N/A'} (${place.reviews || 0} reviews)</p>
                <p>Доступність:</p>
                <ul>
                  ${place.has_ramp ? '<li>✅ Пандус</li>' : ''}
                  ${place.wheelchair_accessible ? '<li>✅ Доступ для візка</li>' : ''}
                  ${place.has_tactile_elements ? '<li>✅ Тактильні елементи</li>' : ''}
                  ${place.accessible_toilet ? '<li>✅ Адаптований туалет</li>' : ''}
                  ${place.easy_entrance ? '<li>✅ Зручний вхід</li>' : ''}
                </ul>
                ${place.image ? `<img src="${place.image}" width="400" style="margin-top:12px;border-radius:12px;">` : ''}
              `;
            });

          markers.push(m);
        });
      });
  }

  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.classList.toggle('active');
      fetchFilteredPlaces();
    });
  });

  const searchButton = document.querySelector('.search-bar button');
  if (searchButton) {
    searchButton.addEventListener('click', () => {
      const searchInput = document.querySelector('.search-bar input');
      const query = searchInput.value;

      if (query) {
        fetch('/search-places/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query })
        })
          .then(res => res.json())
          .then(data => {
            const placesDiv = document.getElementById('places');
            placesDiv.innerHTML = '';

            data.forEach(place => {
              const card = document.createElement('div');
              card.className = 'place-card';
              card.innerHTML = `
                <strong>${place.name}</strong><br>
                ${place.vicinity}<br>
                ⭐ ${place.rating || 'N/A'} (${place.user_ratings_total || 0} reviews)
              `;
              placesDiv.appendChild(card);
            });
          });
      }
    });
  }

  // === Модальне вікно додавання ===
  window.openModal = function () {
    const modal = document.getElementById('add-place-modal');
    if (!modal) return;
    modal.style.display = 'flex';

    const latInput = document.getElementById('input-lat');
    const lngInput = document.getElementById('input-lng');
    if (latInput) latInput.value = selectedLat;
    if (lngInput) lngInput.value = selectedLng;
  };

  window.closeModal = function () {
    const modal = document.getElementById('add-place-modal');
    if (modal) modal.style.display = 'none';
  };

  // === Модальні вікна для відгуків ===
  document.querySelectorAll('.show-all-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const placeId = btn.getAttribute('data-place');
      const modal = document.getElementById(`modal-${placeId}`);
      if (modal) modal.style.display = 'flex';
    });
  });

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.show-all-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const placeId = btn.getAttribute('data-place');
        const modal = document.getElementById(`modal-${placeId}`);
        if (modal) modal.style.display = 'flex';
      });
    });
  
    document.querySelectorAll('.close').forEach(closeBtn => {
      closeBtn.addEventListener('click', () => {
        const placeId = closeBtn.getAttribute('data-place');
        const modal = document.getElementById(`modal-${placeId}`);
        if (modal) modal.style.display = 'none';
      });
    });
  
    window.addEventListener('click', function (event) {
      document.querySelectorAll('.modal').forEach(modal => {
        if (event.target === modal) modal.style.display = 'none';
      });
    });
  });

  // === Початкове завантаження місць ===
  fetchFilteredPlaces();
});
