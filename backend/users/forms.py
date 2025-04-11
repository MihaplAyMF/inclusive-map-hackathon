# users/forms.py

from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth import get_user_model

User = get_user_model()  # Отримуємо кастомну модель користувача

class RegisterForm(UserCreationForm):
    has_special_needs = forms.BooleanField(required=False, label='Я маю особливі потреби')

    class Meta:
        model = User  # Замість User використовуйте вашу кастомну модель
        fields = ['username', 'email', 'password1', 'password2']

    def save(self, commit=True):
        user = super().save(commit)
        if commit:
            user_profile = user.userprofile
            user_profile.has_special_needs = self.cleaned_data['has_special_needs']
            user_profile.save()
        return user

