import type { Ticket, TicketStatus } from '../../types/ticket';
import type { TicketStats } from '../../services/ticketService';

// Common mock ticket data for tests
export const createMockTicket = (overrides: Partial<Ticket> = {}): Ticket => ({
  id: 1,
  title: 'Test Ticket',
  description: 'This is a test ticket description',
  contact_email: 'test@example.com',
  contact_phone: '+1234567890',
  status: 'pending' as TicketStatus,
  created_at: '2024-01-15T10:00:00Z',
  updated_at: '2024-01-15T10:00:00Z',
  ...overrides,
});

export const mockTickets: Ticket[] = [
  createMockTicket({
    id: 1,
    title: 'First Test Ticket',
    status: 'pending',
  }),
  createMockTicket({
    id: 2,
    title: 'Second Test Ticket',
    status: 'accepted',
    contact_phone: null,
  }),
  createMockTicket({
    id: 3,
    title: 'Third Test Ticket',
    status: 'resolved',
  }),
  createMockTicket({
    id: 4,
    title: 'Fourth Test Ticket',
    status: 'rejected',
  }),
];

export const mockTicketStats: TicketStats = {
  total: 4,
  pending: 1,
  accepted: 1,
  resolved: 1,
  rejected: 1,
};

export const createMockStats = (overrides: Partial<TicketStats> = {}): TicketStats => ({
  ...mockTicketStats,
  ...overrides,
});

// Mock API responses
export const mockApiResponses = {
  paginatedTickets: {
    count: mockTickets.length,
    next: null,
    previous: null,
    results: mockTickets,
  },
  
  singleTicket: mockTickets[0],
  
  stats: mockTicketStats,
};

// Mock form data
export const mockCreateTicketData = {
  title: 'New Test Ticket',
  description: 'This is a new test ticket',
  contact_email: 'new@example.com',
  contact_phone: '+9876543210',
};

export const mockUpdateTicketData = {
  title: 'Updated Test Ticket',
  description: 'This is an updated test ticket',
  status: 'resolved' as TicketStatus,
};

// Helper functions for tests
export const getTicketsByStatus = (status: TicketStatus): Ticket[] => {
  return mockTickets.filter(ticket => ticket.status === status);
};

export const getTicketById = (id: number): Ticket | undefined => {
  return mockTickets.find(ticket => ticket.id === id);
};

// Mock error responses
export const mockApiErrors = {
  networkError: new Error('Network Error'),
  
  validationError: {
    response: {
      status: 400,
      data: {
        title: ['This field is required.'],
        contact_email: ['Enter a valid email address.'],
      },
    },
  },
  
  notFoundError: {
    response: {
      status: 404,
      data: { detail: 'Not found.' },
    },
  },
  
  serverError: {
    response: {
      status: 500,
      data: { detail: 'Internal server error.' },
    },
  },
};

// Mock date utilities for consistent testing
export const mockDates = {
  now: '2024-01-15T16:00:00Z',
  oneHourAgo: '2024-01-15T15:00:00Z',
  oneDayAgo: '2024-01-14T16:00:00Z',
  oneWeekAgo: '2024-01-08T16:00:00Z',
};

// Test helpers
export const setupDateMocks = (currentTime = mockDates.now) => {
  jest.spyOn(Date, 'now').mockReturnValue(new Date(currentTime).getTime());
};

export const cleanupDateMocks = () => {
  jest.restoreAllMocks();
};