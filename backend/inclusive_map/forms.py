# forms.py

from django import forms
from .models import AccessibilitySuggestion

class AccessibilitySuggestionForm(forms.ModelForm):
    class Meta:
        model = AccessibilitySuggestion
        fields = [
            'has_ramp', 'has_tactile_elements', 'wheelchair_accessible',
            'accessible_toilet', 'easy_entrance', 'comment'
        ]
