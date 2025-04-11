# map/views.py
from django.http import JsonResponse
import requests
from django.views.decorators.csrf import csrf_exempt
import json
from config.settings import API_KEY

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



from django.shortcuts import render

def index(request):
    return render(request, 'map/main.html')

def register(request):
    return render(request, 'users/reg.html')

