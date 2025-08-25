import { renderHook, act, waitFor } from '@testing-library/react';
import { useTickets } from '../../hooks/useTickets';
import ticketService from '../../services/ticketService';
import type { Ticket, CreateTicketData, UpdateTicketData, TicketStatus } from '../../types/ticket';
import type { TicketStats } from '../../services/ticketService';

// Mock the ticket service
jest.mock('../../services/ticketService');
const mockTicketService = ticketService as jest.Mocked<typeof ticketService>;

// Mock data
const mockTickets: Ticket[] = [
  {
    id: 1,
    title: 'Test Ticket 1',
    description: 'Description 1',
    contact_email: 'test1@example.com',
    contact_phone: '+1234567890',
    status: 'pending' as TicketStatus,
    created_at: '2025-01-15T10:00:00Z',
    updated_at: '2025-01-15T10:00:00Z',
  },
  {
    id: 2,
    title: 'Test Ticket 2',
    description: 'Description 2',
    contact_email: 'test2@example.com',
    contact_phone: null,
    status: 'accepted' as TicketStatus,
    created_at: '2025-01-15T11:00:00Z',
    updated_at: '2025-01-15T11:00:00Z',
  },
];

const mockStats: TicketStats = {
  total: 2,
  pending: 1,
  accepted: 1,
  resolved: 0,
  rejected: 0,
};

const mockNewTicket: Ticket = {
  id: 3,
  title: 'New Ticket',
  description: 'New Description',
  contact_email: 'new@example.com',
  contact_phone: null,
  status: 'pending' as TicketStatus,
  created_at: '2025-01-15T12:00:00Z',
  updated_at: '2025-01-15T12:00:00Z',
};

describe('useTickets', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockTicketService.getTickets.mockResolvedValue(mockTickets);
    mockTicketService.getTicketStats.mockResolvedValue(mockStats);
  });

  it('should load tickets and stats on mount by default', async () => {
    const { result } = renderHook(() => useTickets());

    expect(result.current.isLoading).toBe(true);
    expect(result.current.tickets).toEqual([]);
    expect(result.current.stats).toBeNull();

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.tickets).toEqual(mockTickets);
    expect(result.current.stats).toEqual(mockStats);
    expect(result.current.error).toBeNull();
    expect(mockTicketService.getTickets).toHaveBeenCalledWith({});
    expect(mockTicketService.getTicketStats).toHaveBeenCalled();
  });

  it('should handle fetch error correctly', async () => {
    const errorMessage = 'Failed to fetch';
    mockTicketService.getTickets.mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useTickets());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe(errorMessage);
    expect(result.current.tickets).toEqual([]);
    expect(result.current.stats).toBeNull();
  });

  it('should clear error when clearError is called', async () => {
    const errorMessage = 'Failed to fetch';
    mockTicketService.getTickets.mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useTickets());

    await waitFor(() => {
      expect(result.current.error).toBe(errorMessage);
    });

    act(() => {
      result.current.clearError();
    });

    expect(result.current.error).toBeNull();
  });

  it('should fetch tickets with params', async () => {
    const { result } = renderHook(() => useTickets({ initialLoad: false }));

    const params = { status: 'pending' as TicketStatus };

    await act(async () => {
      await result.current.fetchTickets(params);
    });

    expect(mockTicketService.getTickets).toHaveBeenCalledWith(params);
    expect(result.current.tickets).toEqual(mockTickets);
  });

  it('should create a new ticket and update state', async () => {
    mockTicketService.createTicket.mockResolvedValue(mockNewTicket);
    mockTicketService.getTicketStats.mockResolvedValue({
      ...mockStats,
      total: 3,
      pending: 2,
    });

    const { result } = renderHook(() => useTickets());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const createData: CreateTicketData = {
      title: 'New Ticket',
      description: 'New Description',
      contact_email: 'new@example.com',
    };

    let createdTicket: Ticket;
    await act(async () => {
      createdTicket = await result.current.createTicket(createData);
    });

    expect(createdTicket!).toEqual(mockNewTicket);
    expect(result.current.tickets[0]).toEqual(mockNewTicket);
    expect(result.current.tickets).toHaveLength(3);
    expect(result.current.stats?.total).toBe(3);
    expect(result.current.stats?.pending).toBe(2);
    expect(mockTicketService.createTicket).toHaveBeenCalledWith(createData);
  });

  it('should update a ticket and refresh stats when status changes', async () => {
    const updatedTicket = { ...mockTickets[0], status: 'resolved' as TicketStatus };
    mockTicketService.updateTicket.mockResolvedValue(updatedTicket);
    mockTicketService.getTicketStats.mockResolvedValue({
      ...mockStats,
      pending: 0,
      resolved: 1,
    });

    const { result } = renderHook(() => useTickets());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const updateData: UpdateTicketData = { status: 'resolved' };

    let updated: Ticket;
    await act(async () => {
      updated = await result.current.updateTicket(1, updateData);
    });

    expect(updated!).toEqual(updatedTicket);
    expect(result.current.tickets[0]).toEqual(updatedTicket);
    expect(result.current.stats?.pending).toBe(0);
    expect(result.current.stats?.resolved).toBe(1);
    expect(mockTicketService.updateTicket).toHaveBeenCalledWith(1, updateData);
  });

  it('should update ticket status and refresh stats', async () => {
    const updatedTicket = { ...mockTickets[0], status: 'accepted' as TicketStatus };
    mockTicketService.updateTicketStatus.mockResolvedValue(updatedTicket);
    mockTicketService.getTicketStats.mockResolvedValue({
      ...mockStats,
      pending: 0,
      accepted: 2,
    });

    const { result } = renderHook(() => useTickets());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    let updated: Ticket;
    await act(async () => {
      updated = await result.current.updateTicketStatus(1, 'accepted');
    });

    expect(updated!).toEqual(updatedTicket);
    expect(result.current.tickets[0].status).toBe('accepted');
    expect(result.current.stats?.pending).toBe(0);
    expect(result.current.stats?.accepted).toBe(2);
    expect(mockTicketService.updateTicketStatus).toHaveBeenCalledWith(1, 'accepted');
  });

  it('should auto refresh when enabled', async () => {
    jest.useFakeTimers();
    
    const { result } = renderHook(() => 
      useTickets({ autoRefresh: true, refreshInterval: 1000 })
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Clear initial calls
    mockTicketService.getTickets.mockClear();
    mockTicketService.getTicketStats.mockClear();

    // Advance timer
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    await waitFor(() => {
      expect(mockTicketService.getTickets).toHaveBeenCalledTimes(1);
      expect(mockTicketService.getTicketStats).toHaveBeenCalledTimes(1);
    });

    jest.useRealTimers();
  });
});