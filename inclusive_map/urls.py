from django.urls import path
from . import views

urlpatterns = [
    path('get-location-info/', views.get_location_info, name='get_location_info'),
    path('', views.index, name='index'), 
    path('api/add-place/', views.api_add_place, name='api_add_place'),
]
