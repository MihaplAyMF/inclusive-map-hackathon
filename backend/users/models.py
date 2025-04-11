# users/models.py

from django.db import models
from django.contrib.auth.models import AbstractUser

class UserProfile(AbstractUser):
    bio = models.TextField(blank=True, null=True)
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    has_special_needs = models.BooleanField(default=False)  # Додаємо поле для особливих потреб

    def __str__(self):
        return self.username

