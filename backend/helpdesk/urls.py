
# urls.py (app-level)
from django.urls import path
from . import views

urlpatterns = [
    path('tickets/', views.TicketListCreateAPIView.as_view(), name='ticket-list-create'),
    path('tickets/<int:pk>/', views.TicketRetrieveUpdateAPIView.as_view(), name='ticket-detail'),
    path('tickets/stats/', views.ticket_stats, name='ticket-stats'),
]
