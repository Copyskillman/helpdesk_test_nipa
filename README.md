# Helpdesk Ticketing System

A full-stack helpdesk ticketing system built with Django REST Framework (backend) and React/TypeScript (frontend).

## Getting Started

### Development Setup

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd TEST_NIPA
   ```

2. Backend Setup:

   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: .\venv\Scripts\activate
   pip install -r requirements.txt
   python manage.py migrate
   python manage.py createsuperuser
   python manage.py runserver
   ```

3. Frontend Setup:

   cd frontend
   npm install
   npm run dev


### Authentication
Both documentation interfaces require authentication. Use these credentials:
- **Username**: `admin`
- **Password**: `123456`

### Docker Setup

1. Start the application:

   docker-compose up --build

2. Access the application:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000
   - Admin Panel: http://localhost:8000/admin

Get All Tickets
GET http://127.0.0.1:8000/tickets/ (curl --location --request GET 'http://127.0.0.1:8000/tickets/' \
--header 'Content-Type: application/json' \
--header 'Authorization: Basic YWRtaW46MTIzNDU2' \
--data-raw '{
"title": "Test Ticket4",
"description": "This is a test ticket",
"contact_email": "test@example.com",
"contact_phone": "0123456789"
}'
)
Create Ticket
POST http://127.0.0.1:8000/tickets/ (curl --location --request POST 'http://127.0.0.1:8000/tickets/' \
--header 'Content-Type: application/json' \
--header 'Authorization: Basic YWRtaW46MTIzNDU2' \
--data-raw '{
"title": "Test Ticket4",
"description": "This is a test ticket",
"contact_email": "test@example.com",
"contact_phone": "0123456789"
}'
)
Update Ticket
PUT http://127.0.0.1:8000/tickets/1/ (curl --location --request PUT 'http://127.0.0.1:8000/tickets/1/' \
--header 'Content-Type: application/json' \
--header 'Authorization: Basic YWRtaW46MTIzNDU2' \
--data-raw '{
"title": "Test Ticket4",
"description": "This is a test ticket",
"contact_email": "test@example.com",
"contact_phone": "0123456789"
}'
)

## 📚 API Documentation

Interactive API documentation is available at:
- **Swagger UI**: http://localhost:8000/swagger/
  - Test endpoints directly in your browser
- **ReDoc**: http://localhost:8000/redoc/
  - Clean, responsive documentation

### Key Endpoints

#### List/Create Tickets
- **GET** `/tickets/` - List all tickets
- **POST** `/tickets/` - Create a new ticket

#### Manage Single Ticket
- **GET** `/tickets/{id}/` - Get ticket details
- **PUT** `/tickets/{id}/` - Update ticket

For more details and to try out the API, visit the [Swagger UI](http://localhost:8000/swagger/) or [ReDoc](http://localhost:8000/redoc/) documentation.

## 🏗 Project Structure

```
.
├── backend/               # Django backend
│   ├── backend/           # Project settings
│   ├── helpdesk/          # Helpdesk app
│   ├── tests/             # Backend tests
│   ├── manage.py          # Django management script
│   └── requirements.txt   # Python dependencies
├── frontend/              # React frontend
│   ├── public/            # Static files
│   ├── src/               # Source code
│   │   ├── components/    # React components
│   │   ├── services/      # API services
│   │   └── App.tsx        # Main application component
│   └── package.json       # Node dependencies
└── docker-compose.yml     # Docker configuration
```

## Testing

### Backend Tests

```bash
cd backend
pytest
```

### Frontend Tests

```bash
cd frontend
npm test
```
