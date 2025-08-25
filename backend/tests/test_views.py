import pytest
import json
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from helpdesk.models import Ticket
from .factories import (
    TicketFactory, 
    PendingTicketFactory, 
    AcceptedTicketFactory,
    ResolvedTicketFactory,
    RejectedTicketFactory
)

@pytest.mark.unit
class TestTicketListCreateAPIView(TestCase):
    """Test cases for TicketListCreateAPIView"""
    
    def setUp(self):
        """Set up test data"""
        self.client = APIClient()
        self.list_url = reverse('ticket-list-create')
        
        # Create test tickets with different statuses
        self.pending_ticket = PendingTicketFactory(title="Pending Ticket")
        self.accepted_ticket = AcceptedTicketFactory(title="Accepted Ticket")
        self.resolved_ticket = ResolvedTicketFactory(title="Resolved Ticket")
        self.rejected_ticket = RejectedTicketFactory(title="Rejected Ticket")
    
    def test_get_all_tickets(self):
        """Test GET request to retrieve all tickets"""
        response = self.client.get(self.list_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Check pagination structure
        data = response.json()
        self.assertIn('results', data)
        self.assertIn('count', data)
        
        # Should return all 4 tickets
        self.assertEqual(data['count'], 4)
        self.assertEqual(len(data['results']), 4)
    
    def test_filter_tickets_by_status(self):
        """Test filtering tickets by status"""
        # Filter by pending status
        response = self.client.get(self.list_url, {'status': 'pending'})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        
        self.assertEqual(data['count'], 1)
        self.assertEqual(data['results'][0]['status'], 'pending')
        self.assertEqual(data['results'][0]['title'], 'Pending Ticket')
    
    def test_create_ticket_valid(self):
        """Test creating a new ticket with valid data"""
        ticket_data = {
            'title': 'New Support Request',
            'description': 'This is a detailed description of the support request',
            'contact_email': 'user@example.com',
            'contact_phone': '1234567890'
        }
        
        response = self.client.post(
            self.list_url, 
            data=json.dumps(ticket_data), 
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        data = response.json()
        self.assertEqual(data['title'], 'New Support Request')
        self.assertEqual(data['description'], 'This is a detailed description of the support request')
        self.assertEqual(data['contact_email'], 'user@example.com')
        self.assertEqual(data['contact_phone'], '1234567890')
        self.assertEqual(data['status'], 'pending')  # Default status
        
        # Verify ticket was created in database
        self.assertTrue(Ticket.objects.filter(title='New Support Request').exists())

@pytest.mark.unit
class TestTicketRetrieveUpdateAPIView(TestCase):
    """Test cases for TicketRetrieveUpdateAPIView"""
    
    def setUp(self):
        """Set up test data"""
        self.client = APIClient()
        self.ticket = PendingTicketFactory(title="Test Update Ticket")
        self.detail_url = reverse('ticket-detail', kwargs={'pk': self.ticket.pk})
    
    def test_get_single_ticket(self):
        """Test GET request to retrieve single ticket"""
        response = self.client.get(self.detail_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        data = response.json()
        self.assertEqual(data['id'], self.ticket.id)
        self.assertEqual(data['title'], self.ticket.title)
        self.assertEqual(data['description'], self.ticket.description)
        self.assertEqual(data['status'], self.ticket.status)
    
    def test_update_ticket_full(self):
        """Test full update (PUT) of ticket"""
        update_data = {
            'title': 'Fully Updated Ticket',
            'description': 'This ticket has been completely updated with new information',
            'contact_email': 'updated@example.com',
            'contact_phone': '9876543210',
            'status': 'accepted'
        }
        
        response = self.client.put(
            self.detail_url,
            data=json.dumps(update_data),
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        data = response.json()
        self.assertEqual(data['title'], 'Fully Updated Ticket')
        self.assertEqual(data['description'], 'This ticket has been completely updated with new information')
        self.assertEqual(data['contact_email'], 'updated@example.com')
        self.assertEqual(data['contact_phone'], '9876543210')
        self.assertEqual(data['status'], 'accepted')
        
        # Verify update in database
        self.ticket.refresh_from_db()
        self.assertEqual(self.ticket.title, 'Fully Updated Ticket')
        self.assertEqual(self.ticket.status, 'accepted')

@pytest.mark.unit
class TestTicketStatsView(TestCase):
    """Test cases for ticket_stats view"""
    
    def setUp(self):
        """Set up test data"""
        self.client = APIClient()
        self.stats_url = reverse('ticket-stats')
        
        # Create tickets with different statuses
        PendingTicketFactory.create_batch(3)
        AcceptedTicketFactory.create_batch(2) 
        ResolvedTicketFactory.create_batch(4)
        RejectedTicketFactory.create_batch(1)
    
    def test_get_ticket_stats(self):
        """Test GET request to retrieve ticket statistics"""
        response = self.client.get(self.stats_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        data = response.json()
        
        # Check all required fields are present
        self.assertIn('total', data)
        self.assertIn('pending', data)
        self.assertIn('accepted', data)
        self.assertIn('resolved', data)
        self.assertIn('rejected', data)
        
        # Check counts match our test data
        self.assertEqual(data['total'], 10)  # 3+2+4+1
        self.assertEqual(data['pending'], 3)
        self.assertEqual(data['accepted'], 2)
        self.assertEqual(data['resolved'], 4)
        self.assertEqual(data['rejected'], 1)