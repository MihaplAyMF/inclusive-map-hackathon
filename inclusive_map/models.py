from django.db import models

class Place(models.Model):
    name = models.CharField(max_length=255)
    address = models.CharField(max_length=500)
    latitude = models.FloatField()
    longitude = models.FloatField()

    # Параметри доступності
    has_ramp = models.BooleanField(default=False)            # Пандус
    has_tactile_elements = models.BooleanField(default=False) # Тактильні елементи
    wheelchair_accessible = models.BooleanField(default=False) # Доступ на візку
    accessible_toilet = models.BooleanField(default=False)     # Адаптований туалет
    easy_entrance = models.BooleanField(default=False)         # Зручний вхід

    # Оцінка
    average_rating = models.FloatField(default=0.0)
    total_reviews = models.PositiveIntegerField(default=0)

    image = models.ImageField(upload_to='places/', blank=True, null=True)

    def __str__(self):
        return self.name


# class Review(models.Model):
#     place = models.ForeignKey(Place, on_delete=models.CASCADE, related_name='reviews')
#     user_name = models.CharField(max_length=100)
#     comment = models.TextField()
#     rating = models.IntegerField(choices=[(i, i) for i in range(1, 6)])  # Оцінка від 1 до 5
#     created_at = models.DateTimeField(auto_now_add=True)

#     def __str__(self):
#         return f"{self.user_name} → {self.place.name} ({self.rating}⭐)"
