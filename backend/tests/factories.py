import factory
from factory.django import DjangoModelFactory
from faker import Faker
from helpdesk.models import Ticket

fake = Faker()

class TicketFactory(DjangoModelFactory):
    """Factory for creating Ticket instances"""
    
    class Meta:
        model = Ticket
        django_get_or_create = ('title',)
    
    title = factory.Sequence(lambda n: f"Test Ticket {n}")
    description = factory.LazyAttribute(lambda obj: fake.text(max_nb_chars=200))
    contact_email = factory.LazyAttribute(lambda obj: fake.email())
    contact_phone = factory.LazyAttribute(lambda obj: fake.phone_number()[:20])
    status = factory.Iterator(['pending', 'accepted', 'resolved', 'rejected'])
    
    @factory.post_generation
    def validate_title(self, create, extracted, **kwargs):
        """Ensure title is at least 3 characters"""
        if len(self.title) < 3:
            self.title = f"Test {self.title}"
    
    @factory.post_generation  
    def validate_description(self, create, extracted, **kwargs):
        """Ensure description is at least 10 characters"""
        if len(self.description) < 10:
            self.description = "This is a test description with enough characters"

class PendingTicketFactory(TicketFactory):
    """Factory specifically for pending tickets"""
    status = 'pending'

class AcceptedTicketFactory(TicketFactory):
    """Factory specifically for accepted tickets"""
    status = 'accepted'

class ResolvedTicketFactory(TicketFactory):
    """Factory specifically for resolved tickets"""
    status = 'resolved'

class RejectedTicketFactory(TicketFactory):
    """Factory specifically for rejected tickets"""
    status = 'rejected'
    
class MinimalTicketFactory(TicketFactory):
    """Factory for creating minimal valid tickets"""
    title = "Test"
    description = "Test description"
    contact_email = "test@example.com"
    contact_phone = None
    status = 'pending'