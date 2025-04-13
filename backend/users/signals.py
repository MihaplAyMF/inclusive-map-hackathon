from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.models import User  
from users.models import CustomUser  

@receiver(post_save, sender=User)  
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        CustomUser.objects.create(user=instance)  
