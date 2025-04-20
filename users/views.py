# users/views.py
from django.contrib.auth.decorators import login_required
from django.shortcuts import render, redirect
from django.contrib.auth import login, authenticate
from django.contrib.auth.forms import AuthenticationForm
from django.shortcuts import render
from django.contrib import messages
from django.urls import reverse

from inclusive_map.models import AccessibilitySuggestion, Place
from .forms import ProfileUpdateForm, RegisterForm
from django.contrib import auth, messages

def home(request):
    return render(request, 'base.html')

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
        username = request.POST.get('username')
        password = request.POST.get('password')

        
        user = authenticate(request, username=username, password=password)  # аутентифікація
        if user is not None:
            login(request, user)  # використання правильного login
            messages.success(request, f'{username}, Ви успішно ввійшли в акаунт')
            return redirect('home')  # перенаправлення на головну після входу
        else:
            # Якщо користувача не знайдено або неправильний пароль
            return render(request, 'users/login.html', {'error': 'Невірні дані для входу'})
    return render(request, 'users/login.html')

@login_required
def profile_view(request):
    user = request.user

    if request.method == 'POST':
        form = ProfileUpdateForm(request.POST, request.FILES, instance=user)
        if form.is_valid():
            form.save()
            return redirect('profile')
    else:
        form = ProfileUpdateForm(instance=user)

    user_places = Place.objects.filter(created_by=user)
    user_suggestions = AccessibilitySuggestion.objects.filter(user=user)

    return render(request, 'users/profile.html', {
        'form': form,
        'user_places': user_places,
        'user_suggestions': user_suggestions
    })

@login_required
def logout(request):
    messages.success(request, f'{request.user.username}, Ви вийшли з акаунта')
    auth.logout(request)
    return redirect('home')
