# users/views.py

from django.shortcuts import render, redirect
from .forms import RegisterForm
from django.contrib.auth import login, authenticate

def register_view(request):
    if request.method == 'POST':
        form = RegisterForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)              
            return redirect('home')  # Перенаправляє на головну сторінку після реєстрації
    else:
        form = RegisterForm()
    return render(request, 'users/register.html', {'form': form})

