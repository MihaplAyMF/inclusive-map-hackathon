from django.conf import settings
from django.conf.urls.static import static

from django.urls import include, path

from . import views

urlpatterns = [
    path('get-location-info/', views.get_location_info, name='get_location_info'),
    path('', views.index, name='index'), 
    path('api/add-place/', views.api_add_place, name='api_add_place'),
    path('filter-places/', views.filter_places, name='filter_places'),
    path('routes/', views.route_page, name='route_page'),
    path('reviews/', views.reviews_page, name='reviews'),
    path('reviews/add/<int:place_id>/', views.add_review, name='add_review'),
    path('suggest/<int:place_id>/', views.suggest_accessibility, name='suggest_accessibility'),

]+ static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
