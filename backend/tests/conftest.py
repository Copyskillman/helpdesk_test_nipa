import pytest
from django.test import override_settings
from django.core.management import call_command
from rest_framework.test import APIClient

# Database setup is handled automatically by pytest-django

@pytest.fixture
def api_client():
    """Provide API client for testing"""
    return APIClient()

@pytest.fixture
def sample_ticket_data():
    """Provide sample ticket data for testing"""
    return {
        'title': 'Test Ticket',
        'description': 'This is a test ticket description',
        'contact_email': 'test@example.com',
        'contact_phone': '1234567890'
    }

@pytest.fixture
def create_test_tickets():
    """Create a set of test tickets for testing"""
    from .factories import (
        PendingTicketFactory, 
        AcceptedTicketFactory,
        ResolvedTicketFactory,
        RejectedTicketFactory
    )
    
    return {
        'pending': PendingTicketFactory.create_batch(3),
        'accepted': AcceptedTicketFactory.create_batch(2),
        'resolved': ResolvedTicketFactory.create_batch(4),
        'rejected': RejectedTicketFactory.create_batch(1)
    }

@pytest.fixture(autouse=True)
def enable_db_access_for_all_tests(db):
    """Enable database access for all tests by default"""
    pass

# Test database configuration is handled by test_settings.py

# Pytest markers
pytest_markers = [
    "unit: marks tests as unit tests",
    "integration: marks tests as integration tests", 
    "slow: marks tests as slow running tests"
]