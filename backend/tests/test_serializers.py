import pytest
from django.test import TestCase
from rest_framework import serializers
from helpdesk.serializers import (
    TicketSerializer, 
    TicketCreateSerializer, 
    TicketUpdateSerializer
)
from .factories import TicketFactory, PendingTicketFactory

@pytest.mark.unit
class TestTicketSerializer(TestCase):
    """Test cases for TicketSerializer"""
    
    def setUp(self):
        """Set up test data"""
        self.ticket = TicketFactory()
        self.valid_data = {
            'title': 'Valid Test Ticket',
            'description': 'This is a valid test description with enough characters',
            'contact_email': 'test@example.com',
            'contact_phone': '1234567890',
            'status': 'pending'
        }
    
    def test_ticket_serialization(self):
        """Test serializing a ticket instance"""
        serializer = TicketSerializer(self.ticket)
        data = serializer.data
        
        self.assertEqual(data['id'], self.ticket.id)
        self.assertEqual(data['title'], self.ticket.title)
        self.assertEqual(data['description'], self.ticket.description)
        self.assertEqual(data['contact_email'], self.ticket.contact_email)
        self.assertEqual(data['status'], self.ticket.status)
        self.assertIn('created_at', data)
        self.assertIn('updated_at', data)
    
    def test_ticket_deserialization_valid(self):
        """Test deserializing valid ticket data"""
        serializer = TicketSerializer(data=self.valid_data)
        
        self.assertTrue(serializer.is_valid())
        ticket = serializer.save()
        
        self.assertEqual(ticket.title, 'Valid Test Ticket')
        self.assertEqual(ticket.description, 'This is a valid test description with enough characters')
        self.assertEqual(ticket.contact_email, 'test@example.com')
        self.assertEqual(ticket.contact_phone, '1234567890')
        self.assertEqual(ticket.status, 'pending')
    
    def test_ticket_title_validation_too_short(self):
        """Test title validation - too short"""
        invalid_data = self.valid_data.copy()
        invalid_data['title'] = 'Hi'  # Less than 3 characters
        
        serializer = TicketSerializer(data=invalid_data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('title', serializer.errors)
        self.assertIn('at least 3 characters', str(serializer.errors['title'][0]))
    
    def test_ticket_description_validation_too_short(self):
        """Test description validation - too short"""
        invalid_data = self.valid_data.copy()
        invalid_data['description'] = 'Too short'  # Less than 10 characters
        
        serializer = TicketSerializer(data=invalid_data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('description', serializer.errors)
        self.assertIn('at least 10 characters', str(serializer.errors['description'][0]))

@pytest.mark.unit
class TestTicketCreateSerializer(TestCase):
    """Test cases for TicketCreateSerializer"""
    
    def setUp(self):
        """Set up test data"""
        self.valid_data = {
            'title': 'New Test Ticket',
            'description': 'This is a new test ticket description',
            'contact_email': 'new@example.com',
            'contact_phone': '9876543210'
        }
    
    def test_create_ticket_valid(self):
        """Test creating ticket with valid data"""
        serializer = TicketCreateSerializer(data=self.valid_data)
        
        self.assertTrue(serializer.is_valid())
        ticket = serializer.save()
        
        self.assertEqual(ticket.title, 'New Test Ticket')
        self.assertEqual(ticket.description, 'This is a new test ticket description')
        self.assertEqual(ticket.contact_email, 'new@example.com')
        self.assertEqual(ticket.contact_phone, '9876543210')
        self.assertEqual(ticket.status, 'pending')  # Default status

@pytest.mark.unit 
class TestTicketUpdateSerializer(TestCase):
    """Test cases for TicketUpdateSerializer"""
    
    def setUp(self):
        """Set up test data"""
        self.ticket = PendingTicketFactory()
        self.update_data = {
            'title': 'Updated Test Ticket',
            'description': 'This is an updated test ticket description',
            'contact_email': 'updated@example.com',
            'contact_phone': '5555555555',
            'status': 'accepted'
        }
    
    def test_partial_update(self):
        """Test partial update of ticket"""
        partial_data = {
            'status': 'resolved',
            'title': 'Partially Updated Title'
        }
        
        serializer = TicketUpdateSerializer(self.ticket, data=partial_data, partial=True)
        self.assertTrue(serializer.is_valid())
        
        updated_ticket = serializer.save()
        
        # Updated fields
        self.assertEqual(updated_ticket.status, 'resolved')
        self.assertEqual(updated_ticket.title, 'Partially Updated Title')
        
        # Unchanged fields
        self.assertEqual(updated_ticket.description, self.ticket.description)
        self.assertEqual(updated_ticket.contact_email, self.ticket.contact_email)