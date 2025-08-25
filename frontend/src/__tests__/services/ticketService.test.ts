import ticketService from '../../services/ticketService';
import apiService from '../../services/api';
import type { Ticket, CreateTicketData, UpdateTicketData, TicketStatus } from '../../types/ticket';
import type { TicketStats, TicketListParams, PaginatedResponse } from '../../services/ticketService';
import { createAxiosResponse, createAxiosError } from '../testUtils/axiosMocks';

// Mock the API service
jest.mock('../../services/api');
const mockApiService = apiService as jest.Mocked<typeof apiService>;

// Mock data
const mockTickets: Ticket[] = [
  {
    id: 1,
    title: 'Test Ticket 1',
    description: 'Description 1',
    contact_email: 'test1@example.com',
    contact_phone: '+1234567890',
    status: 'pending' as TicketStatus,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
  },
  {
    id: 2,
    title: 'Test Ticket 2',
    description: 'Description 2',
    contact_email: 'test2@example.com',
    contact_phone: null,
    status: 'accepted' as TicketStatus,
    created_at: '2024-01-15T11:00:00Z',
    updated_at: '2024-01-15T11:00:00Z',
  },
];

const mockPaginatedResponse: PaginatedResponse<Ticket> = {
  count: 2,
  next: null,
  previous: null,
  results: mockTickets,
};

const mockStats: TicketStats = {
  total: 2,
  pending: 1,
  accepted: 1,
  resolved: 0,
  rejected: 0,
};

describe('TicketService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch tickets successfully', async () => {
    mockApiService.get.mockResolvedValue(createAxiosResponse(mockPaginatedResponse));

    const result = await ticketService.getTickets();

    expect(mockApiService.get).toHaveBeenCalledWith('/tickets/', {});
    expect(result).toEqual(mockTickets);
  });

  it('should fetch single ticket by ID', async () => {
    const ticket = mockTickets[0];
    mockApiService.get.mockResolvedValue(createAxiosResponse(ticket));

    const result = await ticketService.getTicket(1);

    expect(mockApiService.get).toHaveBeenCalledWith('/tickets/1/');
    expect(result).toEqual(ticket);
  });

  it('should create a new ticket', async () => {
    const createData: CreateTicketData = {
      title: 'New Ticket',
      description: 'New Description',
      contact_email: 'new@example.com',
    };

    const newTicket: Ticket = {
      id: 3,
      ...createData,
      contact_phone: null,
      status: 'pending' as TicketStatus,
      created_at: '2024-01-15T12:00:00Z',
      updated_at: '2024-01-15T12:00:00Z',
    };

    mockApiService.post.mockResolvedValue(createAxiosResponse(newTicket));

    const result = await ticketService.createTicket(createData);

    expect(mockApiService.post).toHaveBeenCalledWith('/tickets/', createData);
    expect(result).toEqual(newTicket);
  });

  it('should update a ticket', async () => {
    const updateData: UpdateTicketData = {
      title: 'Updated Title',
      status: 'resolved' as TicketStatus,
    };

    const updatedTicket: Ticket = {
      ...mockTickets[0],
      ...updateData,
      updated_at: '2024-01-15T13:00:00Z',
    };

    mockApiService.patch.mockResolvedValue(createAxiosResponse(updatedTicket));

    const result = await ticketService.updateTicket(1, updateData);

    expect(mockApiService.patch).toHaveBeenCalledWith('/tickets/1/', updateData);
    expect(result).toEqual(updatedTicket);
  });

  it('should update ticket status', async () => {
    const updatedTicket: Ticket = {
      ...mockTickets[0],
      status: 'accepted' as TicketStatus,
      updated_at: '2024-01-15T13:00:00Z',
    };

    mockApiService.patch.mockResolvedValue(createAxiosResponse(updatedTicket));

    const result = await ticketService.updateTicketStatus(1, 'accepted');

    expect(mockApiService.patch).toHaveBeenCalledWith('/tickets/1/', { status: 'accepted' });
    expect(result).toEqual(updatedTicket);
  });

  it('should fetch ticket statistics', async () => {
    mockApiService.get.mockResolvedValue(createAxiosResponse(mockStats));

    const result = await ticketService.getTicketStats();

    expect(mockApiService.get).toHaveBeenCalledWith('/tickets/stats/');
    expect(result).toEqual(mockStats);
  });
});