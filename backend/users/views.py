# users/views.py

from django.shortcuts import render, redirect
from django.contrib.auth import login, authenticate
from django.contrib.auth.forms import AuthenticationForm
from django.shortcuts import render
from django.contrib import messages
from .forms import RegisterForm

def register_view(request):
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


def login_view(request):
    if request.method == 'POST':
        username = request.POST['username']
        password = request.POST['password']
        
        user = authenticate(request, username=username, password=password)  # аутентифікація
        if user is not None:
            login(request, user)  # використання правильного login
            return redirect('home')  # перенаправлення на головну після входу
        else:
            # Якщо користувача не знайдено або неправильний пароль
            return render(request, 'users/login.html', {'error': 'Невірні дані для входу'})
    return render(request, 'users/login.html')


def home(request):
    return render(request, 'base.html')
