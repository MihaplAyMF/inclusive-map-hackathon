document.addEventListener('DOMContentLoaded', () => {
    // Відкрити модальне вікно з усіма відгуками
    document.querySelectorAll('.show-all-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const placeId = btn.getAttribute('data-place');
        const modal = document.getElementById(`modal-${placeId}`);
        if (modal) modal.style.display = 'flex';
      });
    });
  
    // Закриття при кліку на хрестик
    document.querySelectorAll('.close').forEach(closeBtn => {
      closeBtn.addEventListener('click', () => {
        const placeId = closeBtn.getAttribute('data-place');
        const modal = document.getElementById(`modal-${placeId}`);
        if (modal) modal.style.display = 'none';
      });
    });
  
    // Закриття при кліку поза вікном
    window.addEventListener('click', event => {
      document.querySelectorAll('.modal').forEach(modal => {
        if (event.target === modal) modal.style.display = 'none';
      });
    });
  });
  