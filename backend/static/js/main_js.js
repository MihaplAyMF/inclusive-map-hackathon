document.addEventListener('DOMContentLoaded', function () {
  let marker;
  let markers = [];
  let selectedLat = null;
  let selectedLng = null;

  const map = L.map('map').setView([49.8397, 24.0297], 16);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  // === Клік по мапі ===
  map.on('click', function (e) {
    selectedLat = e.latlng.lat;
    selectedLng = e.latlng.lng;

    const addBtn = document.getElementById('add-place-btn');
    if (addBtn) addBtn.style.display = 'inline-block';

    if (marker) {
      marker.setLatLng([selectedLat, selectedLng]);
    } else {
      marker = L.marker([selectedLat, selectedLng]).addTo(map);
    }

    fetch('/get-location-info/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lat: selectedLat, lng: selectedLng })
    })
      .then(response => response.json())
      .then(data => {
        const placesDiv = document.getElementById('places');
        if (!placesDiv) return;

        placesDiv.innerHTML = '';
        data.slice(0, 4).forEach(place => {
          const card = document.createElement('div');
          card.className = 'place-card';
          card.innerHTML = `
            <strong>${place.name}</strong><br>
            ${place.vicinity}<br>
            ⭐ ${place.rating || 'N/A'} (${place.user_ratings_total || 0} reviews)
          `;
          placesDiv.appendChild(card);

          card.addEventListener('click', () => {
            const details = document.getElementById('details');
            if (!details) return;

            details.innerHTML = `
              <h3>Деталі місця: ${place.name}</h3>
              <p>Адреса: ${place.vicinity}</p>
              <p>Рейтинг: ⭐ ${place.rating || 'N/A'} (${place.user_ratings_total || 0} reviews)</p>
              <p>Час роботи: ${place.opening_hours?.weekday_text?.join(', ') || 'Не вказано'}</p>
            `;
          });
        });
      });
  });

  // === Відправка форми додавання місця ===
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
        .then(() => {
          document.getElementById('form-status').innerText = 'Місце додано успішно!';
          form.reset();
          setTimeout(closeModal, 2000);
          fetchFilteredPlaces();
        })
        .catch(() => {
          document.getElementById('form-status').innerText = 'Помилка під час додавання.';
        });
    });
  }

  // === Отримати активні фільтри ===
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
 
// === Завантажити фільтровані місця ===
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

          const m = L.marker([place.latitude, place.longitude])
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

          markers.push(m);
        });
      });
  }

  // === Подія кліку по фільтрах ===
  document.querySelectorAll('.filter-btn').forEach(button => {
    button.addEventListener('click', () => {
      button.classList.toggle('active');
      fetchFilteredPlaces();
    });
  });

  // === Пошук ===
  const searchButton = document.querySelector('.search-bar button');
  if (searchButton) {
    searchButton.addEventListener('click', () => {
      const searchInput = document.querySelector('.search-bar input');

      if (!searchInput) return;

      const query = searchInput.value;

      if (query) {
        fetch('/search-places/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: query })
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

  // === Модальне вікно ===
  const addBtn = document.getElementById('add-place-btn');
  const modal = document.getElementById('add-place-modal');
  const modalClose = document.querySelector('.modal .close');

  if (addBtn) {
    addBtn.addEventListener('click', () => {
      if (modal) {
        modal.style.display = 'flex';

        const latInput = document.getElementById('input-lat');
        const lngInput = document.getElementById('input-lng');
        if (latInput) latInput.value = selectedLat;
        if (lngInput) lngInput.value = selectedLng;
      }
    });
  }

  if (modalClose) {
    modalClose.addEventListener('click', () => {
      if (modal) modal.style.display = 'none';
    });
  }

  window.closeModal = function () {
    if (modal) modal.style.display = 'none';
  };

  // === Початкове завантаження ===
  fetchFilteredPlaces();
});
