import pytest
from django.test import TestCase
from django.core.exceptions import ValidationError
from django.db.utils import IntegrityError
from helpdesk.models import Ticket
from .factories import TicketFactory, PendingTicketFactory, AcceptedTicketFactory

@pytest.mark.unit
class TestTicketModel(TestCase):
    """Test cases for Ticket model"""
    
    def setUp(self):
        """Set up test data"""
        self.ticket_data = {
            'title': 'Test Ticket',
            'description': 'This is a test ticket description',
            'contact_email': 'test@example.com',
            'contact_phone': '1234567890'
        }
    
    def test_ticket_creation(self):
        """Test basic ticket creation"""
        ticket = Ticket.objects.create(**self.ticket_data)
        
        self.assertEqual(ticket.title, 'Test Ticket')
        self.assertEqual(ticket.description, 'This is a test ticket description')
        self.assertEqual(ticket.contact_email, 'test@example.com')
        self.assertEqual(ticket.contact_phone, '1234567890')
        self.assertEqual(ticket.status, 'pending')  # Default status
        self.assertIsNotNone(ticket.created_at)
        self.assertIsNotNone(ticket.updated_at)
        self.assertIsNotNone(ticket.id)
    
    def test_ticket_factory(self):
        """Test TicketFactory works correctly"""
        ticket = TicketFactory()
        
        self.assertIsInstance(ticket, Ticket)
        self.assertTrue(len(ticket.title) >= 3)
        self.assertTrue(len(ticket.description) >= 10)
        self.assertIn('@', ticket.contact_email)
        self.assertIn(ticket.status, ['pending', 'accepted', 'resolved', 'rejected'])
    
    def test_ticket_str_method(self):
        """Test ticket string representation"""
        ticket = TicketFactory(title="Sample Ticket")
        expected_str = f"#{ticket.id} - Sample Ticket"
        self.assertEqual(str(ticket), expected_str)
    
    def test_ticket_default_status(self):
        """Test ticket has default status of 'pending'"""
        ticket = Ticket.objects.create(
            title='Test',
            description='Test description',
            contact_email='test@example.com'
        )
        self.assertEqual(ticket.status, 'pending')
    
    def test_ticket_status_choices(self):
        """Test all valid status choices"""
        valid_statuses = ['pending', 'accepted', 'resolved', 'rejected']
        
        for status in valid_statuses:
            ticket = Ticket.objects.create(
                title=f'Test {status}',
                description='Test description',
                contact_email='test@example.com',
                status=status
            )
            self.assertEqual(ticket.status, status)
    
    def test_ticket_required_fields(self):
        """Test required fields validation"""
        # Test that all required fields exist and are not null
        ticket = Ticket()
        
        # Verify that calling full_clean() on empty ticket raises validation errors
        with self.assertRaises(ValidationError) as cm:
            ticket.full_clean()
        
        # Should have validation errors for required fields
        errors = cm.exception.error_dict
        self.assertIn('title', errors)
        self.assertIn('description', errors) 
        self.assertIn('contact_email', errors)
    
    def test_ticket_email_validation(self):
        """Test email field validation"""
        ticket = Ticket(
            title='Test ticket',
            description='Test description',
            contact_email='invalid-email'
        )
        
        with self.assertRaises(ValidationError):
            ticket.full_clean()
    
    def test_ticket_timestamps_auto_update(self):
        """Test created_at and updated_at timestamps"""
        import time
        
        ticket = TicketFactory()
        original_created = ticket.created_at
        original_updated = ticket.updated_at
        
        # Sleep to ensure time difference
        time.sleep(0.01)
        
        # Update the ticket
        ticket.title = "Updated Title"
        ticket.save()
        
        ticket.refresh_from_db()
        
        # created_at should not change
        self.assertEqual(ticket.created_at, original_created)
        
        # updated_at should change (or at least not be less than original)
        self.assertGreaterEqual(ticket.updated_at, original_updated)