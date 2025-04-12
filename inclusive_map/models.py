from django.db import models

from users.models import CustomUser

class Place(models.Model):
    name = models.CharField(max_length=255)
    address = models.CharField(max_length=500)
    latitude = models.FloatField()
    longitude = models.FloatField()

    # Параметри доступності
    has_ramp = models.BooleanField(default=False)            
    has_tactile_elements = models.BooleanField(default=False) 
    wheelchair_accessible = models.BooleanField(default=False) 
    accessible_toilet = models.BooleanField(default=False)     
    easy_entrance = models.BooleanField(default=False)         

    # Оцінка
    average_rating = models.FloatField(default=0.0)
    total_reviews = models.PositiveIntegerField(default=0)

    image = models.ImageField(upload_to='places/', blank=True, null=True)

    def average_rating(self):
        return self.reviews.aggregate(models.Avg('rating'))['rating__avg'] or 0

    def total_reviews(self):
        return self.reviews.count()

    def __str__(self):
        return self.name


class Review(models.Model):
    place = models.ForeignKey(Place, on_delete=models.CASCADE, related_name='reviews')
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    rating = models.IntegerField(choices=[(i, str(i)) for i in range(1, 6)])
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} → {self.place.name} ({self.rating}⭐)"
