from django.db import models

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

    def __str__(self):
        return self.name

