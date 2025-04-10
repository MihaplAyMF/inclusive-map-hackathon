from django.urls import path

from . import views

urlpatterns = [
    path('', views.home_page, name="index"),# name там стоїть тупо для url Типу якщо ми захочемо використати посилання в коді HTML на якусь функцію(сторінку) то ми тупо введемо <a href="{% url 'menu' %}">Меню</a>
    path('mainpage/', views.test_page, name="index"),
]
