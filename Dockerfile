# Використовуємо офіційний образ Python
FROM python:3.11-slim

# Встановлюємо залежності
RUN apt-get update && apt-get install -y libpq-dev gcc && rm -rf /var/lib/apt/lists/*

# Встановлюємо залежності Python з requirements.txt
COPY requirements.txt /app/requirements.txt
WORKDIR /app
RUN pip install --no-cache-dir -r requirements.txt

# Копіюємо весь код проєкту в контейнер
COPY . /app/

# Налаштовуємо змінну середовища для Django
ENV PYTHONUNBUFFERED 1

# Запускаємо сервер Django
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
