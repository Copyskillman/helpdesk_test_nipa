# views.py
from rest_framework import generics, status, filters
from rest_framework.response import Response
from rest_framework.decorators import api_view
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
from .models import Ticket
from .serializers import TicketSerializer, TicketCreateSerializer, TicketUpdateSerializer

class TicketListCreateAPIView(generics.ListCreateAPIView):
    queryset = Ticket.objects.all()
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['status']
    ordering_fields = ['created_at', 'updated_at', 'status']
    ordering = ['-updated_at']

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return TicketCreateSerializer
        return TicketSerializer

    def get_queryset(self):
        queryset = Ticket.objects.all()
        
        # Filter by status
        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Search functionality
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) | 
                Q(description__icontains=search) |
                Q(contact_email__icontains=search)
            )
        
        return queryset

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            ticket = serializer.save()
            # Return full ticket data using TicketSerializer
            return_serializer = TicketSerializer(ticket)
            return Response(
                return_serializer.data, 
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class TicketRetrieveUpdateAPIView(generics.RetrieveUpdateAPIView):
    queryset = Ticket.objects.all()
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return TicketUpdateSerializer
        return TicketSerializer

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        
        if serializer.is_valid():
            ticket = serializer.save()
            # Return full ticket data using TicketSerializer
            return_serializer = TicketSerializer(ticket)
            return Response(return_serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def ticket_stats(request):
    """Get ticket statistics"""
    stats = {
        'total': Ticket.objects.count(),
        'pending': Ticket.objects.filter(status='pending').count(),
        'accepted': Ticket.objects.filter(status='accepted').count(),
        'resolved': Ticket.objects.filter(status='resolved').count(),
        'rejected': Ticket.objects.filter(status='rejected').count(),
    }
    return Response(stats)