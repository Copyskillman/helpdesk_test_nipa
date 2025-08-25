# helpdesk/filters.py
import django_filters
from .models import Ticket

class TicketFilter(django_filters.FilterSet):
    status = django_filters.ChoiceFilter(choices=Ticket.STATUS_CHOICES)
    created_after = django_filters.DateTimeFilter(field_name='created_at', lookup_expr='gte')
    created_before = django_filters.DateTimeFilter(field_name='created_at', lookup_expr='lte')
    title = django_filters.CharFilter(field_name='title', lookup_expr='icontains')
    
    class Meta:
        model = Ticket
        fields = ['status', 'created_after', 'created_before', 'title']