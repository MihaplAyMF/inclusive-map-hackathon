# users/admin.py
from django.contrib import admin
from users.models import CustomUser

admin.site.register(CustomUser)
