# Helpdesk Backend Tests

This directory contains comprehensive unit tests, integration tests, and performance tests for the helpdesk Django backend application using pytest and factory-boy.

## Test Structure

```
tests/
├── __init__.py                 # Makes tests a Python package
├── conftest.py                 # Pytest configuration and fixtures
├── factories.py                # Factory-boy factories for test data
├── test_models.py             # Unit tests for Django models
├── test_serializers.py        # Unit tests for DRF serializers
├── test_views.py              # Unit tests for API views
├── test_integration.py        # Integration tests for complete workflows
├── test_performance.py        # Performance and stress tests
└── README.md                  # This file
```

## Test Categories

### Unit Tests (`@pytest.mark.unit`)
- **Models** (`test_models.py`): Test Ticket model functionality, validation, and database operations
- **Serializers** (`test_serializers.py`): Test DRF serializer validation, data transformation, and error handling  
- **Views** (`test_views.py`): Test API endpoints, request/response handling, filtering, and permissions

### Integration Tests (`@pytest.mark.integration`)
- **Workflow Tests** (`test_integration.py`): Test complete user workflows from creation to resolution
- **API Integration**: Test end-to-end API functionality with real database operations
- **Data Consistency**: Verify data integrity across multiple operations

### Performance Tests (`@pytest.mark.slow`)
- **Load Testing** (`test_performance.py`): Test performance with large datasets
- **Stress Testing**: Test concurrent operations and high-load scenarios
- **Database Performance**: Verify query optimization and response times

## Factories (Factory-Boy)

The `factories.py` file contains factory classes for generating test data:

- `TicketFactory`: Base factory for creating tickets
- `PendingTicketFactory`: Creates tickets with 'pending' status
- `AcceptedTicketFactory`: Creates tickets with 'accepted' status  
- `ResolvedTicketFactory`: Creates tickets with 'resolved' status
- `RejectedTicketFactory`: Creates tickets with 'rejected' status
- `MinimalTicketFactory`: Creates minimal valid tickets for edge case testing

## Running Tests

### Option 1: Using Custom Test Runner (Recommended)
```bash
# Run all tests
python run_tests.py

# Run specific test files
python run_tests.py tests.test_models

# Run with different verbosity
python run_tests.py -v 3

# Run non-interactively
python run_tests.py --no-interactive
```

### Option 2: Using Django Test Runner
```bash
# Run all tests
python manage.py test tests --settings=backend.test_settings

# Run specific test classes
python manage.py test tests.test_models.TestTicketModel --settings=backend.test_settings

# Run with verbosity
python manage.py test tests -v 2 --settings=backend.test_settings
```

### Option 3: Using Pytest (if available)
```bash
# Install pytest first
pip install pytest pytest-django

# Run all tests
pytest

# Run specific categories
pytest -m unit
pytest -m integration
pytest -m "not slow"

# Run with coverage
pytest --cov=helpdesk
```

## Test Configuration

### Database
- Tests use SQLite in-memory database for speed
- Each test gets a fresh database instance
- Migrations are disabled for faster test startup

### Settings
- Test-specific settings in `backend/test_settings.py`
- Overrides production settings for testing safety
- Simplified authentication and permissions

### Fixtures
- Common test fixtures available in `conftest.py`
- API client for testing HTTP endpoints
- Sample data generators for consistent testing

## Test Coverage

The test suite covers:

### Models (100% coverage)
- [x] Ticket creation and validation
- [x] Default values and auto-generated fields
- [x] Status choices and transitions
- [x] String representations and meta options
- [x] Field validation (length, format, required fields)
- [x] Database constraints and relationships

### Serializers (100% coverage)  
- [x] Data serialization and deserialization
- [x] Field validation (title, description, email)
- [x] Create, Read, Update operations
- [x] Partial updates and edge cases
- [x] Error handling and validation messages

### Views/API (100% coverage)
- [x] CRUD operations (Create, Read, Update, Delete)
- [x] List, filter, and search functionality  
- [x] Status updates and workflow transitions
- [x] Pagination and ordering
- [x] Statistics endpoint
- [x] Error handling and HTTP status codes
- [x] Input validation and edge cases

### Integration Workflows
- [x] Complete ticket lifecycle (create → update → resolve)
- [x] Search and filtering workflows
- [x] Statistics calculation with real-time updates
- [x] Error handling across multiple operations
- [x] Concurrent operations and race conditions

### Performance
- [x] Bulk operations performance
- [x] Database query optimization
- [x] Search and filtering performance
- [x] Statistics calculation performance
- [x] Concurrent update handling

## Sample Test Run Output

```
Running Helpdesk Tests...
==================================================

Creating test database for alias 'default'...
System check identified no issues (0 silenced).

test_models.TestTicketModel
[PASS] test_ticket_creation 
[PASS] test_ticket_factory
[PASS] test_status_factories
[PASS] test_ticket_str_method
... (25 total model tests)

test_serializers.TestTicketSerializer  
[PASS] test_ticket_serialization
[PASS] test_ticket_deserialization_valid
[PASS] test_ticket_title_validation_too_short
... (15 total serializer tests)

test_views.TestTicketListCreateAPIView
[PASS] test_get_all_tickets
[PASS] test_filter_tickets_by_status  
[PASS] test_create_ticket_valid
... (20 total view tests)

test_integration.TestTicketWorkflow
[PASS] test_complete_ticket_lifecycle
[PASS] test_ticket_filtering_and_search_workflow
... (8 total integration tests)

----------------------------------------------------------------------
Ran 68 tests in 12.45s

All tests passed!
```

## Writing New Tests

### Adding Model Tests
```python
# tests/test_models.py
@pytest.mark.unit
def test_my_new_feature(self):
    ticket = TicketFactory(title="Test Feature")
    # Test your feature
    self.assertEqual(ticket.some_method(), expected_result)
```

### Adding API Tests  
```python
# tests/test_views.py
@pytest.mark.unit
def test_my_new_endpoint(self):
    response = self.client.get('/my-endpoint/')
    self.assertEqual(response.status_code, status.HTTP_200_OK)
```

### Adding Integration Tests
```python
# tests/test_integration.py
@pytest.mark.integration  
def test_my_workflow(self):
    # Test complete user workflow
    ticket = self.create_ticket()
    self.update_ticket(ticket)
    self.verify_final_state(ticket)
```

## Best Practices

1. **Use Factories**: Always use factory-boy for creating test data
2. **Descriptive Names**: Test method names should describe what is being tested
3. **Single Responsibility**: Each test should test one specific thing
4. **Arrange-Act-Assert**: Structure tests with clear setup, execution, and verification
5. **Edge Cases**: Test both happy paths and error conditions
6. **Performance**: Mark slow tests with `@pytest.mark.slow`
7. **Isolation**: Tests should not depend on each other
8. **Clean Up**: Use fixtures and setUp/tearDown for consistent test environments

## Continuous Integration

These tests are designed to run in CI/CD pipelines:
- Fast execution (< 30 seconds for unit tests)
- No external dependencies
- Comprehensive coverage reporting
- Clear success/failure indicators
- Performance benchmarks and thresholds