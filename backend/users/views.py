# users/views.py

from django.shortcuts import render, redirect
from .forms import RegisterForm
from django.contrib.auth import login, authenticate
from django.shortcuts import render

def register(request):
    if request.method == 'POST':
        form = RegisterForm(request.POST)
        if form.is_valid():
            user = form.save()  # Зберігає користувача
            print("User saved:", user)  # Перевірка, чи дані користувача збережені
            login(request, user)  # Логін користувача
            return redirect('home')  # Перенаправляє на домашню сторінку
        else:
            print("Form is not valid. Errors:", form.errors)  # Виведення помилок форми
    else:
        form = RegisterForm()
    return render(request, 'users/register.html', {'form': form})

def reviews(request):
    return render(request, 'users/reviews.html')

def home(request):
    return render(request, 'base.html')
