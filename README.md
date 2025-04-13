# Inclusive Map

Inclusive Map — це веб-сервіс для пошуку інклюзивних локацій з урахуванням потреб людей з інвалідністю. 
Система дозволяє фільтрувати місця за критеріями доступності, переглядати відгуки, пропонувати зміни, а також будувати маршрути з урахуванням інклюзивності.

## Перспективи
Даний проєкт має величезні перспективи розвитку. Проблема людей з обмеженими можливостями є надзвичайно актуальною в умовах нинішньої війни з російським агресором. Її актуальність зростає, та, на жаль, зростатиме з кожним днем. Після закінчення війни, в Україні, з'явиться дуже багато людей, які не матимуть можливості ходити, робити щось руками, і взагалі, людей які не можуть самостійно жити. Тому цей сайт — це невелика спроба полегшити їхнє життя і повернути їм право, яке в них було відібране.

## 🎯 Основні функції
- Пошук локацій з фільтрами (пандуси, тактильні елементи, адаптовані туалети тощо)
- Оцінювання і коментування локацій
- Пропозиції змін до інформації про місця
- Побудова маршрутів з урахуванням доступності
- Підтримка спеціального профілю користувача

## 🛠️ Технології
- **Backend**: Django + PostgreSQL
- **Frontend**: JavaScript

## 🚀 Запуск проєкту 
Вписуєте наступний перелік команд
```git clone https://github.com/MihaplAyMF/inclusive-map-hackathon.git
cd inclusive-map-hackathon
python -m venv venv
source venv/bin/activate 
pip install -r backend/requirevents
python backend/manage.py makemigrations
python backend/manage.py migrate
``` 

Це щоб було те що ми добавили
```
python manage.py loaddata fixtures/inclusive_map/place.json
python manage.py loaddata fixtures/inclusive_map/review.json
python manage.py loaddata fixtures/inclusive_map/sccessibilitysuggestion.json 
python manage.py loaddata fixtures/user/customuser.json
```

А ось це запустить сам сервер
```
python manage.py runserver

```
