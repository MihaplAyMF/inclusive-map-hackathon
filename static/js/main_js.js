document.addEventListener('DOMContentLoaded', function () {
  let marker;
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
    if (addBtn) {
      addBtn.style.display = 'inline-block';
    }

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
        })
        .catch(err => {
          document.getElementById('form-status').innerText = 'Помилка під час додавання.';
        });
    });
  }

  const filterButtons = document.querySelectorAll('.filter-btn');
  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      button.classList.toggle('active');
      // Логіка фільтрації
    });
  });

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

  // Глобальні функції для кнопок
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
});
