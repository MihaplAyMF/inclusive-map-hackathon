# map/views.py
from django.http import JsonResponse
import requests
from django.views.decorators.csrf import csrf_exempt
import json
from config.settings import API_KEY
from inclusive_map.forms import AccessibilitySuggestionForm
from .models import Place
from django.shortcuts import render
from django.shortcuts import get_object_or_404, redirect
from .models import Place, Review
from django.contrib.auth.decorators import login_required

def index(request):
    return render(request, 'map/main.html')

def route_page(request):
    return render(request, 'map/route_map.html')

def reviews_page(request):
    places = Place.objects.all()
    return render(request, 'map/reviews.html', {'places': places})

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


@csrf_exempt
def filter_places(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        queryset = Place.objects.all()

        if data.get('has_ramp'):
            queryset = queryset.filter(has_ramp=True)
        if data.get('has_tactile_elements'):
            queryset = queryset.filter(has_tactile_elements=True)
        if data.get('wheelchair_accessible'):
            queryset = queryset.filter(wheelchair_accessible=True)
        if data.get('accessible_toilet'):
            queryset = queryset.filter(accessible_toilet=True)
        if data.get('easy_entrance'):
            queryset = queryset.filter(easy_entrance=True)

        results = []
        for place in queryset:
            results.append({
                'name': place.name,
                'address': place.address,
                'latitude': place.latitude,
                'longitude': place.longitude,
                'rating': place.average_rating(),
                'reviews': place.total_reviews(),
                'image': place.image.url if place.image else None,
                'has_ramp': place.has_ramp,
                'has_tactile_elements': place.has_tactile_elements,
                'wheelchair_accessible': place.wheelchair_accessible,
                'accessible_toilet': place.accessible_toilet,
                'easy_entrance': place.easy_entrance,
            })

        return JsonResponse(results, safe=False)

    return JsonResponse({'error': 'Invalid method'}, status=405)

@login_required
def add_review(request, place_id):
    place = get_object_or_404(Place, id=place_id)
    if request.method == 'POST':
        rating = request.POST.get('rating')
        comment = request.POST.get('comment')

        # Уникаємо повного дублювання (ідентичний коментар і рейтинг від того ж користувача)
        if not Review.objects.filter(place=place, user=request.user, rating=rating, comment=comment).exists():
            Review.objects.create(
                place=place,
                user=request.user,
                rating=rating,
                comment=comment,
            )

    return redirect(request.META.get('HTTP_REFERER', '/reviews/'))
    
@login_required
def suggest_accessibility(request, place_id):
    place = get_object_or_404(Place, id=place_id)
    if request.method == 'POST':
        form = AccessibilitySuggestionForm(request.POST)
        if form.is_valid():
            suggestion = form.save(commit=False)
            suggestion.user = request.user
            suggestion.place = place
            suggestion.save()
            return redirect('reviews') 
    else:
        form = AccessibilitySuggestionForm()
    return render(request, 'map/suggest_accessibility.html', {'form': form, 'place': place})