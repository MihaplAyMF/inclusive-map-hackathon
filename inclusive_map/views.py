# map/views.py
from django.http import JsonResponse
import requests
from django.views.decorators.csrf import csrf_exempt
import json
from config.settings import API_KEY
from .models import Place
from django.shortcuts import render

def index(request):
    return render(request, 'map/main.html')


@csrf_exempt
def get_location_info(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            lat = data.get('lat')
            lng = data.get('lng')

            if not lat or not lng:
                return JsonResponse({'error': 'Missing coordinates'}, status=400)

            url = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json'
            params = {
                'location': f'{lat},{lng}',
                'radius': 1000,
                'type': 'restaurant',
                'key': API_KEY
            }

            response = requests.get(url, params=params)
            # print(response.text)
            if response.status_code == 200:
                return JsonResponse(response.json().get('results', []), safe=False)
            else:
                return JsonResponse({'error': 'Google API error'}, status=500)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)

    return JsonResponse({'error': 'Invalid request'}, status=400)


@csrf_exempt
def api_add_place(request):
    if request.method == 'POST':
        try:
            place = Place(
                name=request.POST.get('name'),
                address=request.POST.get('address'),
                latitude=request.POST.get('latitude'),
                longitude=request.POST.get('longitude'),
                has_ramp=bool(request.POST.get('has_ramp')),
                has_tactile_elements=bool(request.POST.get('has_tactile_elements')),
                wheelchair_accessible=bool(request.POST.get('wheelchair_accessible')),
                accessible_toilet=bool(request.POST.get('accessible_toilet')),
                easy_entrance=bool(request.POST.get('easy_entrance')),
                image=request.FILES.get('image')
            )
            place.save()
            return JsonResponse({'status': 'ok'})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)
    return JsonResponse({'status': 'invalid'}, status=400)


