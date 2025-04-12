<<<<<<< HEAD
# users/apps.py
=======
# inclusive_map/apps.py
>>>>>>> roman

from django.apps import AppConfig

class UsersConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'users'

    def ready(self):
        import users.signals 
