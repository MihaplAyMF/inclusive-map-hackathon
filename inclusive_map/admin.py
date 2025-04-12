# inclusive_map/admin.py

from django.contrib import admin
from .models import AccessibilitySuggestion, Place, Review

@admin.register(Place)
class PlaceAdmin(admin.ModelAdmin):
    list_display = ('name', 'address', 'average_rating_display', 'total_reviews_display')
    list_filter = ('has_ramp', 'wheelchair_accessible', 'easy_entrance')
    search_fields = ('name', 'address')
    readonly_fields = ('latitude', 'longitude')

    def average_rating_display(self, obj):
        return f"{obj.average_rating():.1f} ⭐"
    average_rating_display.short_description = 'Середня оцінка'

    def total_reviews_display(self, obj):
        return obj.total_reviews()
    total_reviews_display.short_description = 'К-сть відгуків'

@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ('place', 'user', 'rating', 'short_comment', 'created_at')
    list_filter = ('rating', 'created_at')
    search_fields = ('user__username', 'place__name', 'comment')

    def short_comment(self, obj):
        return obj.comment[:30] + '...' if len(obj.comment) > 30 else obj.comment
    short_comment.short_description = 'Коментар'

@admin.register(AccessibilitySuggestion)
class AccessibilitySuggestionAdmin(admin.ModelAdmin):
    list_display = ('place', 'user', 'status', 'submitted_at')
    list_filter = ('status',)
    actions = ['approve_suggestions', 'reject_suggestions']

    @admin.action(description="Схвалити вибрані пропозиції та оновити місце")
    def approve_suggestions(self, request, queryset):
        for suggestion in queryset:
            suggestion.status = 'approved'
            suggestion.save()
            suggestion.apply_to_place()  # 🟢 застосувати зміни

    @admin.action(description="Відхилити вибрані пропозиції")
    def reject_suggestions(self, request, queryset):
        queryset.update(status='rejected')