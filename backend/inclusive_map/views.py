from django.shortcuts import render
from django.http import HttpResponse
# Create your views here.

def home_page(respond):
    return HttpResponse("<h1>ЛАПУХІ ПІТУХІ<h1>")

def test_page(respond):
    return HttpResponse("<h1>Тестовий url<h1>")