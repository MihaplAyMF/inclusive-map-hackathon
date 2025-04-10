let marker;

const map = L.map('map').setView([49.8397, 24.0297], 16);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Обробка кліку на карті
map.on('click', function (e) {
  const lat = e.latlng.lat;
  const lng = e.latlng.lng;

  console.log(`Координати кліку: lat = ${lat}, lng = ${lng}`);

  if (marker) {
    marker.setLatLng([lat, lng]);
  } else {
    marker = L.marker([lat, lng]).addTo(map);
  }

  fetch('/get-location-info/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ lat: lat, lng: lng })
  })
    .then(response => response.json())
    .then(data => {
      const placesDiv = document.getElementById('places');
      placesDiv.innerHTML = '';

      const maxPlacesToShow = 4;  // Обмежуємо кількість місць, що показуються

      // Виводимо перші 3-4 місця
      data.slice(0, maxPlacesToShow).forEach(place => {
        const card = document.createElement('div');
        card.className = 'place-card';
        card.innerHTML = `
          <strong>${place.name}</strong><br>
          ${place.vicinity}<br>
          ⭐ ${place.rating || 'N/A'} (${place.user_ratings_total || 0} reviews)
        `;
        placesDiv.appendChild(card);

        // Додаємо обробник події для кліку по картці
        card.addEventListener('click', () => {
            const detailsPanel = document.getElementById('details');
            detailsPanel.innerHTML = `
              <h3>Деталі місця: ${place.name}</h3>
              <p>Адреса: ${place.vicinity}</p>
              <p>Рейтинг: ⭐ ${place.rating || 'N/A'} (${place.user_ratings_total || 0} reviews)</p>
              <p>Час роботи: ${place.opening_hours && place.opening_hours.weekday_text ? place.opening_hours.weekday_text.join(', ') : 'Не вказано'}</p>
            `;
          });
      });
    })
    .catch(error => {
      console.error('Error fetching location info:', error);
    });
});

// Фільтрація за категоріями
const filterButtons = document.querySelectorAll('.filter-btn');
filterButtons.forEach(button => {
  button.addEventListener('click', () => {
    // Додаємо/знімаємо активний клас з кнопки
    button.classList.toggle('active');
    
    // Тут можна додати додаткову логіку фільтрації місць
    // Наприклад, в залежності від того, які фільтри активовані, можна змінювати запит до сервера
  });
});

// Панель пошуку
const searchButton = document.querySelector('.search-bar button');
searchButton.addEventListener('click', () => {
  const searchQuery = document.querySelector('.search-bar input').value;

  if (searchQuery) {
    fetch('/search-places/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
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

          // Додаємо обробник події для кліку по картці
          card.addEventListener('click', () => {
            const detailsPanel = document.getElementById('details');
            detailsPanel.innerHTML = `
              <h3>Деталі місця: ${place.name}</h3>
              <p>Адреса: ${place.vicinity}</p>
              <p>Рейтинг: ⭐ ${place.rating || 'N/A'} (${place.user_ratings_total || 0} reviews)</p>
              <p>Час роботи: ${place.opening_hours && place.opening_hours.weekday_text ? place.opening_hours.weekday_text.join(', ') : 'Не вказано'}</p>
            `;
          });
        });
      })
      .catch(error => {
        console.error('Error searching places:', error);
      });
  }
});
