# users/models.py

from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):
    bio = models.TextField(blank=True, null=True)
<<<<<<< HEAD
=======
    first_name = models.CharField(max_length=150, blank=True, null=True)
    last_name = models.CharField(max_length=150, blank=True, null=True)
>>>>>>> roman
    has_special_needs = models.BooleanField(default=False)

    def __str__(self):
        return self.username

