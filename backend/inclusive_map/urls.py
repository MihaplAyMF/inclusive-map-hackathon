from django.urls import path, include
from . import views

urlpatterns = [
    path('get-location-info/', views.get_location_info, name='get_location_info'),
    path('', views.index, name='index'), 
    path('users/', include('users.urls')), 
]
