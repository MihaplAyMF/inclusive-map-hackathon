from django.conf import settings
from django.conf.urls.static import static
<<<<<<< HEAD
from django.urls import path
=======
from django.urls import path, include 
>>>>>>> master
from . import views

urlpatterns = [
    path('get-location-info/', views.get_location_info, name='get_location_info'),
    path('', views.index, name='index'), 
    path('api/add-place/', views.api_add_place, name='api_add_place'),
    path('filter-places/', views.filter_places, name='filter_places'),
    path('routes/', views.route_page, name='route_page'),
<<<<<<< HEAD
=======
    path('users/', include('users.urls')), 
>>>>>>> master
]+ static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
