document.addEventListener('DOMContentLoaded', function () {
  let marker;
  let markers = [];

  const map = L.map('map').setView([49.8397, 24.0297], 16);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  let selectedLat = null;
  let selectedLng = null;

  // === КЛІК ПО МАПІ ===
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
      body: JSON.stringify({ lat: lat, lng: lng })
    })
      .then(response => response.json())
      .then(data => {
        const placesDiv = document.getElementById('places');
        if (!placesDiv) return;

        placesDiv.innerHTML = '';
        const maxPlacesToShow = 4;

        data.slice(0, maxPlacesToShow).forEach(place => {
          const card = document.createElement('div');
          card.className = 'place-card';
          card.innerHTML = `
            <strong>${place.name}</strong><br>
            ${place.vicinity}<br>
            ⭐ ${place.rating || 'N/A'} (${place.user_ratings_total || 0} reviews)
          `;
          placesDiv.appendChild(card);

          card.addEventListener('click', () => {
            const detailsPanel = document.getElementById('details');
            if (!detailsPanel) return;

            detailsPanel.innerHTML = `
              <h3>Деталі місця: ${place.name}</h3>
              <p>Адреса: ${place.vicinity}</p>
              <p>Рейтинг: ⭐ ${place.rating || 'N/A'} (${place.user_ratings_total || 0} reviews)</p>
              <p>Час роботи: ${place.opening_hours && place.opening_hours.weekday_text ? place.opening_hours.weekday_text.join(', ') : 'Не вказано'}</p>
            `;
          });
        });
      });
  });

  // === ДОДАВАННЯ МІСЦЯ ===
  const form = document.getElementById('add-place-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      const formData = new FormData(form);
      const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;

      fetch('/api/add-place/', {
        method: 'POST',
        headers: { 'X-CSRFToken': csrfToken },
        body: formData
      })
        .then(res => res.json())
        .then(data => {
          document.getElementById('form-status').innerText = 'Місце додано успішно!';
          form.reset();
          setTimeout(window.closeModal, 2000);
          fetchFilteredPlaces(); // оновити мапу
        })
        .catch(err => {
          document.getElementById('form-status').innerText = 'Помилка під час додавання.';
        });
    });
  }

  // === ФІЛЬТРИ ===
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
          const popupContent = `
            <strong>${place.name}</strong><br>
            ${place.address}<br>
            ⭐ ${place.rating || 'N/A'} (${place.reviews || 0} reviews)
          `;

          const marker = L.marker([place.latitude, place.longitude])
            .addTo(map)
            .bindPopup(popupContent)
            .on('click', () => {
              const detailsPanel = document.getElementById('details');
              if (!detailsPanel) return;

              detailsPanel.innerHTML = `
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

          markers.push(marker);
        });
      });
  }

  document.querySelectorAll('.filter-btn').forEach(button => {
    button.addEventListener('click', () => {
      button.classList.toggle('active');
      fetchFilteredPlaces();
    });
  });

  // === ПОШУК ===
  const searchButton = document.querySelector('.search-bar button');
  if (searchButton) {
    searchButton.addEventListener('click', () => {
      const searchInput = document.querySelector('.search-bar input');
      if (!searchInput) return;

      const searchQuery = searchInput.value;

      if (searchQuery) {
        fetch('/search-places/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: searchQuery })
        })
          .then(response => response.json())
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

  // === МОДАЛЬНЕ ВІКНО ===
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

  // === ПЕРШЕ ЗАВАНТАЖЕННЯ ФІЛЬТРОВАНИХ МІСЦЬ ===
  fetchFilteredPlaces();
});
