# Help Desk Frontend Workflow Documentation

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Data Models & Types](#data-models--types)
3. [State Management](#state-management)
4. [Core Workflows](#core-workflows)
5. [Component Architecture](#component-architecture)
6. [Data Flow](#data-flow)

## Architecture Overview

The Help Desk frontend is built using React with TypeScript, implementing a Kanban-style ticket management system. The architecture follows a component-based approach with API-driven state management using custom hooks and a dedicated services layer for backend communication.

### Component Structure
```
App.tsx (Root Component)
├── TicketFilters.tsx (Search, Filter, Sort)
├── KanbanBoard.tsx (Main Display)
│   └── TicketCard.tsx (Individual Tickets)
├── TicketForm.tsx (Create Modal)
├── EditTicketModal.tsx (Edit Modal)
├── ErrorBoundary.tsx (Global Error Handling)
└── LoadingSpinner.tsx (Loading UI Component)

Services Layer:
├── services/api.ts (Axios HTTP Client)
├── services/ticketService.ts (API Endpoints)
├── hooks/useTickets.ts (Data Management Hook)
└── types/ticket.ts (Extended Type Definitions)
```

## Data Models & Types

### Core Types (`src/types/ticket.ts`)

#### Ticket Status
```typescript
export type TicketStatus = 'pending' | 'accepted' | 'resolved' | 'rejected';
```

#### Main Ticket Interface
```typescript
// Lines 3-12: Core ticket data structure
export interface Ticket {
  id: number;
  title: string;
  description: string;
  contact_email: string;
  contact_phone?: string;
  status: TicketStatus;
  created_at: string;
  updated_at: string;
}
```

#### Data Transfer Objects
```typescript
// Lines 14-19: For creating new tickets
export interface CreateTicketData {
  title: string;
  description: string;
  contact_email: string;
  contact_phone?: string;
}

// Lines 21-27: For updating existing tickets
export interface UpdateTicketData {
  title?: string;
  description?: string;
  contact_email?: string;
  contact_phone?: string;
  status?: TicketStatus;
}
```

#### UI Configuration
```typescript
// Lines 29-34: Status display labels
export const TICKET_STATUS_LABELS: Record<TicketStatus, string> = {
  pending: 'Pending',
  accepted: 'Accepted',
  resolved: 'Resolved',
  rejected: 'Rejected',
};

// Lines 36-41: Status color schemes for UI
export const TICKET_STATUS_COLORS: Record<TicketStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  accepted: 'bg-blue-100 text-blue-800 border-blue-200',
  resolved: 'bg-green-100 text-green-800 border-green-200',
  rejected: 'bg-red-100 text-red-800 border-red-200',
};
```

#### API Response Types
```typescript
// Lines 43-47: Error handling types
export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
  status?: number;
}

// Lines 49-52: Loading state management
export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

// Lines 54-63: Complete tickets state with statistics
export interface TicketsState extends LoadingState {
  tickets: Ticket[];
  stats?: {
    total: number;
    pending: number;
    accepted: number;
    resolved: number;
    rejected: number;
  };
};
```

## State Management

### API Services Layer

#### API Service (`src/services/api.ts`)
```typescript
// Centralized axios configuration with interceptors
import axios from 'axios';
import type { AxiosInstance, AxiosResponse, AxiosError } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

class ApiService {
  private api: AxiosInstance;
  
  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: { 'Content-Type': 'application/json' }
    });
    this.setupInterceptors(); // Request/response logging and error handling
  }
}
```

#### Ticket Service (`src/services/ticketService.ts`)
```typescript
// All ticket-related API operations
class TicketService {
  async getTickets(params: TicketListParams = {}): Promise<Ticket[]> {
    // Handles paginated Django REST Framework responses
    const response = await apiService.get<PaginatedResponse<Ticket>>(this.TICKETS_ENDPOINT, queryParams);
    return response.data.results || [];
  }
  
  async createTicket(ticketData: CreateTicketData): Promise<Ticket>
  async updateTicket(id: number, ticketData: UpdateTicketData): Promise<Ticket>
  async updateTicketStatus(id: number, status: TicketStatus): Promise<Ticket>
  async getTicketStats(): Promise<TicketStats>
}
```

### Custom Hook State Management (`src/hooks/useTickets.ts`)

#### useTickets Hook
```typescript
// Centralized ticket state management with API integration
export const useTickets = (options: UseTicketsOptions = {}): UseTicketsResult => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [stats, setStats] = useState<TicketStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch tickets with server-side filtering/sorting
  const fetchTickets = useCallback(async (params: TicketListParams = {}) => {
    setIsLoading(true);
    try {
      const [ticketsData, statsData] = await Promise.all([
        ticketService.getTickets(params),
        ticketService.getTicketStats()
      ]);
      setTickets(ticketsData);
      setStats(statsData);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  return { tickets, stats, isLoading, error, fetchTickets, createTicket, updateTicket, ... };
};
```

### App Component State (`src/App.tsx`)

#### Core State Variables  
```typescript
// Lines 12-16: UI state (API state managed by useTickets hook)
const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);         // Create modal visibility
const [editingTicket, setEditingTicket] = useState<Ticket | null>(null); // Edit modal state
const [statusFilter, setStatusFilter] = useState<TicketStatus | 'all'>('all'); // Filter state
const [sortBy, setSortBy] = useState<SortOption>('updated_desc');        // Sort state
const [searchQuery, setSearchQuery] = useState('');                      // Search state

// Lines 18-27: API state from useTickets hook
const {
  tickets,                    // From API
  isLoading,                 // Loading state
  error,                     // Error state
  createTicket: createTicketApi,
  updateTicket: updateTicketApi,
  updateTicketStatus: updateTicketStatusApi,
  fetchTickets,
  clearError,
} = useTickets();
```

#### API Operation Wrappers
```typescript
// Lines 29-36: Create new ticket via API
const createTicket = async (data: CreateTicketData) => {
  try {
    await createTicketApi(data);                   // API call via useTickets hook
    setIsCreateFormOpen(false);                    // Close modal on success
  } catch (err) {
    console.error('Failed to create ticket:', err);
  }
};

// Lines 38-45: Update existing ticket via API
const updateTicket = async (ticketId: number, data: UpdateTicketData) => {
  try {
    await updateTicketApi(ticketId, data);         // API call via useTickets hook
    setEditingTicket(null);                        // Close edit modal on success
  } catch (err) {
    console.error('Failed to update ticket:', err);
  }
};

// Lines 47-53: Quick status change via API
const updateTicketStatus = async (ticketId: number, status: TicketStatus) => {
  try {
    await updateTicketStatusApi(ticketId, status); // API call via useTickets hook
  } catch (err) {
    console.error('Failed to update ticket status:', err);
  }
};
```

#### Server-Side Filtering & Sorting
```typescript
// Lines 55-68: Server-side filtering with real-time API calls
useEffect(() => {
  const fetchFilteredTickets = async () => {
    const params = {
      status: statusFilter,                         // Server-side status filter
      search: searchQuery,                          // Server-side text search
      ordering: ticketService.buildOrderingParam(sortBy), // Server-side sorting
    };
    
    await fetchTickets(params);                     // Fetch from API with filters
  };

  fetchFilteredTickets();
}, [statusFilter, sortBy, searchQuery, fetchTickets]);

// Lines 70: No client-side processing needed - tickets already filtered by server
const filteredAndSortedTickets = tickets;
```

## Core Workflows

### 1. Ticket Creation Workflow

#### Trigger
- User clicks "New Ticket" button (`App.tsx:98`)
- `setIsCreateFormOpen(true)` opens the modal

#### TicketForm Component (`src/components/TicketForm.tsx`)

##### Form State Management
```typescript
// Lines 11-16: Form state
const [formData, setFormData] = useState<CreateTicketData>({
  title: '',
  description: '',
  contact_email: '',
  contact_phone: '',
});

// Lines 18-19: Error state for validation & loading state
const [errors, setErrors] = useState<Partial<Record<keyof CreateTicketData, string>>>({});
const [isSubmitting, setIsSubmitting] = useState(false);
```

##### Validation Logic
```typescript
// Lines 20-39: Form validation
const validateForm = () => {
  const newErrors: Partial<Record<keyof CreateTicketData, string>> = {};

  // Title validation (min 3 characters)
  if (!formData.title.trim() || formData.title.trim().length < 3) {
    newErrors.title = 'Title must be at least 3 characters long';
  }

  // Description validation (min 10 characters)
  if (!formData.description.trim() || formData.description.trim().length < 10) {
    newErrors.description = 'Description must be at least 10 characters long';
  }

  // Email validation
  if (!formData.contact_email.trim()) {
    newErrors.contact_email = 'Email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contact_email)) {
    newErrors.contact_email = 'Please enter a valid email address';
  }

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};
```

##### Form Submission
```typescript
// Lines 42-69: Async form submission handler with loading states
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!validateForm()) return;

  setIsSubmitting(true);                          // Show loading state
  setErrors({});

  try {
    await onSubmit({                              // Calls App.createTicket (async)
      ...formData,
      title: formData.title.trim(),
      description: formData.description.trim(),
      contact_email: formData.contact_email.trim(),
      contact_phone: formData.contact_phone?.trim() || undefined,
    });

    // Reset form data on success
    setFormData({ title: '', description: '', contact_email: '', contact_phone: '' });
  } catch (error) {
    console.error('Form submission error:', error);
  } finally {
    setIsSubmitting(false);                       // Hide loading state
  }
};
```

#### Flow Sequence
```
User clicks "New Ticket" → Modal opens → User fills form → Validation → 
If valid: Loading spinner shown → API call to POST /tickets/ → 
Success: Ticket created in backend → Frontend state updated → Modal closes → UI refreshed
Error: Error message displayed → User can retry
If invalid: Show validation errors → User corrects → Retry
```

### 2. Kanban Board Display Workflow

#### KanbanBoard Component (`src/components/KanbanBoard.tsx`)

##### Column Configuration
```typescript
// Lines 17-22: Status columns definition
const statusColumns: TicketStatus[] = [
  "pending",
  "accepted", 
  "resolved",
  "rejected",
];
```

##### Data Organization
```typescript
// Lines 24-29: Filter tickets by status for each column with null safety
const getTicketsByStatus = (status: TicketStatus) => {
  if (!Array.isArray(tickets)) {
    return [];
  }
  return tickets.filter((ticket) => ticket.status === status);
};
```

##### Visual Styling
```typescript
// Lines 28-36: Column background colors
const getColumnColor = (status: TicketStatus) => {
  const colors = {
    pending: "border-yellow-200 bg-yellow-50",
    accepted: "border-blue-200 bg-blue-50", 
    resolved: "border-green-200 bg-green-50",
    rejected: "border-red-200 bg-red-50",
  };
  return colors[status];
};

// Lines 38-46: Header colors
const getHeaderColor = (status: TicketStatus) => {
  const colors = {
    pending: "bg-yellow-100 text-yellow-800",
    accepted: "bg-blue-100 text-blue-800",
    resolved: "bg-green-100 text-green-800", 
    rejected: "bg-red-100 text-red-800",
  };
  return colors[status];
};
```

#### TicketCard Component (`src/components/TicketCard.tsx`)

##### Display Information
```typescript
// Lines 12-20: Date formatting
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Lines 22-34: Relative time calculation
const getTimeDifference = (dateString: string) => {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffMinutes > 0) return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
  return 'Just now';
};
```

##### Quick Status Changes
```typescript
// Lines 36-40: Handle status change buttons with API calls
const handleStatusChange = (newStatus: TicketStatus) => {
  if (newStatus !== ticket.status) {
    onStatusChange(ticket.id, newStatus);        // Calls App.updateTicketStatus (async API call)
  }
};
```

### 3. Ticket Editing Workflow

#### EditTicketModal Component (`src/components/EditTicketModal.tsx`)

##### Modal State Synchronization  
```typescript
// Lines 28-39: Sync form with selected ticket
useEffect(() => {
  if (ticket) {
    setFormData({
      title: ticket.title,
      description: ticket.description,
      contact_email: ticket.contact_email,
      contact_phone: ticket.contact_phone || '',
      status: ticket.status,
    });
    setErrors({});
  }
}, [ticket]);
```

##### Validation & Submission
```typescript
// Lines 41-58: Similar validation to create form + status field
const validateForm = () => {
  // Same validation logic as TicketForm
  // Plus status validation if needed
};

// Form submission calls App.updateTicket with ticket ID and changes
```

#### Flow Sequence
```
User clicks edit button on TicketCard → setEditingTicket(ticket) → Modal opens → 
Form pre-populated → User makes changes → Validation → 
If valid: Loading spinner shown → API call to PATCH /tickets/{id}/ → 
Success: Ticket updated in backend → Frontend state updated → Modal closes → UI refreshed
Error: Error message displayed → User can retry
```

### 4. Filtering & Sorting Workflow

#### TicketFilters Component (`src/components/TicketFilters.tsx`)

##### Sort Options
```typescript
// Lines 5: Sort option types
export type SortOption = 'updated_desc' | 'updated_asc' | 'created_desc' | 'created_asc' | 'title_asc' | 'title_desc';

// Lines 26-32: Sort option configuration
const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'updated_desc', label: 'Latest Update' },
  { value: 'updated_asc', label: 'Oldest Update' },
  { value: 'created_desc', label: 'Newest Created' },
  { value: 'created_asc', label: 'Oldest Created' },
  { value: 'title_asc', label: 'Title A-Z' },
  { value: 'title_desc', label: 'Title Z-A' },
];
```

##### Filter Controls
- **Search Input**: Filters by title, description, email, or ticket ID
- **Status Dropdown**: Filters by ticket status or shows all
- **Sort Dropdown**: Orders tickets by various criteria

#### Real-time Server-Side Filtering
All filters trigger real-time API calls to the backend with query parameters. When filter state changes, new API requests are made to GET /tickets/ with appropriate filters (lines 55-68 in `App.tsx`).

## Component Architecture

### Props Flow

#### App → TicketFilters
```typescript
<TicketFilters
  statusFilter={statusFilter}                    // Current status filter
  sortBy={sortBy}                                // Current sort option
  searchQuery={searchQuery}                      // Current search query
  onStatusFilterChange={setStatusFilter}         // Status filter callback (triggers API call)
  onSortChange={setSortBy}                       // Sort callback (triggers API call)
  onSearchChange={setSearchQuery}                // Search callback (triggers API call)
  ticketCount={filteredAndSortedTickets.length}  // Results count from API
/>
```

#### App → KanbanBoard  
```typescript
<KanbanBoard
  tickets={filteredAndSortedTickets}             // Filtered/sorted tickets
  onEditTicket={setEditingTicket}                // Edit callback
  onStatusChange={updateTicketStatus}            // Quick status change
/>
```

#### KanbanBoard → TicketCard
```typescript
<TicketCard
  key={ticket.id}
  ticket={ticket}                                // Individual ticket data
  onEdit={onEditTicket}                          // Edit callback passthrough
  onStatusChange={onStatusChange}                // Status callback passthrough
/>
```

#### App → TicketForm
```typescript
<TicketForm
  onSubmit={createTicket}                        // Async create callback with API
  onCancel={() => setIsCreateFormOpen(false)}    // Cancel callback  
  isOpen={isCreateFormOpen}                      // Modal visibility
/>
```

#### App → EditTicketModal
```typescript
<EditTicketModal
  ticket={editingTicket}                         // Ticket to edit
  onSave={updateTicket}                          // Async update callback with API
  onCancel={() => setEditingTicket(null)}        // Cancel callback
  isOpen={!!editingTicket}                       // Modal visibility
/>
```

## Data Flow

### State Change Propagation

```
User Action → Component Handler → API Call → Backend Update → Frontend State Update → Re-render → UI Update
```

#### Example: Creating a Ticket
```
1. User clicks "New Ticket" button
   ↓
2. setIsCreateFormOpen(true) in App
   ↓  
3. TicketForm modal appears
   ↓
4. User fills form and submits
   ↓
5. TicketForm calls onSubmit(data) [async]
   ↓
6. App.createTicket(data) → useTickets.createTicket() → API POST /tickets/
   ↓
7. Backend creates ticket and returns new ticket data
   ↓
8. Frontend state updated with new ticket from API response
   ↓
9. Stats refreshed via GET /tickets/stats/
   ↓
10. App re-renders with new ticket
    ↓
11. KanbanBoard re-renders with updated data
    ↓
12. New TicketCard appears in "Pending" column
```

#### Example: Changing Status
```
1. User clicks status button on TicketCard
   ↓
2. TicketCard.handleStatusChange(newStatus)
   ↓  
3. onStatusChange(ticket.id, newStatus) called [async]
   ↓
4. App.updateTicketStatus → useTickets.updateTicketStatus() → API PATCH /tickets/{id}/
   ↓
5. Backend updates ticket status and returns updated ticket
   ↓
6. Frontend state updated with response data
   ↓
7. Stats refreshed via GET /tickets/stats/
   ↓
8. KanbanBoard re-renders with updated data
   ↓
9. Ticket moves to new status column with updated timestamp
```

### Performance Optimizations

1. **Server-Side Processing**: Filtering and sorting done on backend, reducing client-side computation
2. **API Request Debouncing**: Search queries use useEffect to avoid excessive API calls
3. **Loading States**: UI feedback during API operations prevents user confusion
4. **Error Boundaries**: Global error handling prevents app crashes
5. **Component Keys**: Each TicketCard has a unique `key={ticket.id}` for efficient re-rendering
6. **Optimistic Updates**: Local state updated immediately, with error rollback on API failure

### Data Persistence

The application is fully integrated with a Django REST API backend. All ticket data is persisted in the backend database:

- **Create Operations**: POST /tickets/ creates tickets in database
- **Read Operations**: GET /tickets/ retrieves paginated data with server-side filtering
- **Update Operations**: PATCH /tickets/{id}/ updates individual tickets
- **Statistics**: GET /tickets/stats/ provides real-time ticket counts by status
- **Real-time Sync**: All operations immediately sync with backend database
- **No Local Storage**: No client-side data persistence needed

### Error Handling

- **Form Validation**: Client-side validation prevents invalid data entry
- **TypeScript Safety**: Compile-time type checking for all API interactions
- **API Error Handling**: Axios interceptors catch and log network errors
- **Global Error Boundary**: ErrorBoundary component catches React errors with retry functionality
- **Loading States**: User feedback during all async operations
- **Network Error Recovery**: Automatic error messages with clear user guidance
- **Validation Error Display**: Backend validation errors shown to users with specific field feedback

---

This documentation provides a complete overview of the Help Desk frontend workflow, including detailed code references and data flow patterns. Each workflow is traced from user interaction through state changes to UI updates.