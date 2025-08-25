import { useState, useEffect, useCallback } from 'react';
import type { Ticket, CreateTicketData, UpdateTicketData, TicketStatus, LoadingState } from '../types/ticket';
import ticketService from '../services/ticketService';
import type { TicketListParams, TicketStats } from '../services/ticketService';

export interface UseTicketsOptions {
  initialLoad?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export interface UseTicketsResult extends LoadingState {
  tickets: Ticket[];
  stats: TicketStats | null;
  createTicket: (data: CreateTicketData) => Promise<Ticket>;
  updateTicket: (id: number, data: UpdateTicketData) => Promise<Ticket>;
  updateTicketStatus: (id: number, status: TicketStatus) => Promise<Ticket>;
  fetchTickets: (params?: TicketListParams) => Promise<void>;
  refreshTickets: () => Promise<void>;
  clearError: () => void;
}

export const useTickets = (options: UseTicketsOptions = {}): UseTicketsResult => {
  const {
    initialLoad = true,
    autoRefresh = false,
    refreshInterval = 30000, // 30 seconds
  } = options;

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [stats, setStats] = useState<TicketStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastParams, setLastParams] = useState<TicketListParams>({});

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const fetchTickets = useCallback(async (params: TicketListParams = {}) => {
    setIsLoading(true);
    setError(null);
    setLastParams(params);

    try {
      const [ticketsData, statsData] = await Promise.all([
        ticketService.getTickets(params),
        ticketService.getTicketStats()
      ]);

      setTickets(ticketsData);
      setStats(statsData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch tickets';
      setError(errorMessage);
      console.error('Error in fetchTickets:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshTickets = useCallback(async () => {
    await fetchTickets(lastParams);
  }, [fetchTickets, lastParams]);

  const createTicket = useCallback(async (data: CreateTicketData): Promise<Ticket> => {
    setError(null);
    
    try {
      const newTicket = await ticketService.createTicket(data);
      
      // Add the new ticket to the current list and refresh stats
      setTickets(prev => [newTicket, ...prev]);
      
      // Refresh stats
      try {
        const statsData = await ticketService.getTicketStats();
        setStats(statsData);
      } catch (statsError) {
        console.warn('Failed to refresh stats after creating ticket:', statsError);
      }
      
      return newTicket;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create ticket';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const updateTicket = useCallback(async (id: number, data: UpdateTicketData): Promise<Ticket> => {
    setError(null);
    
    try {
      const updatedTicket = await ticketService.updateTicket(id, data);
      
      // Update the ticket in the current list
      setTickets(prev => 
        prev.map(ticket => 
          ticket.id === id ? updatedTicket : ticket
        )
      );
      
      // Refresh stats if status was changed
      if (data.status) {
        try {
          const statsData = await ticketService.getTicketStats();
          setStats(statsData);
        } catch (statsError) {
          console.warn('Failed to refresh stats after updating ticket:', statsError);
        }
      }
      
      return updatedTicket;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update ticket';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const updateTicketStatus = useCallback(async (id: number, status: TicketStatus): Promise<Ticket> => {
    setError(null);
    
    try {
      const updatedTicket = await ticketService.updateTicketStatus(id, status);
      
      // Update the ticket in the current list
      setTickets(prev => 
        prev.map(ticket => 
          ticket.id === id ? updatedTicket : ticket
        )
      );
      
      // Refresh stats
      try {
        const statsData = await ticketService.getTicketStats();
        setStats(statsData);
      } catch (statsError) {
        console.warn('Failed to refresh stats after status update:', statsError);
      }
      
      return updatedTicket;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update ticket status';
      setError(errorMessage);
      throw err;
    }
  }, []);

  // Initial load effect
  useEffect(() => {
    if (initialLoad) {
      fetchTickets();
    }
  }, [initialLoad, fetchTickets]);

  // Auto-refresh effect
  useEffect(() => {
    if (!autoRefresh) return;

    const intervalId = setInterval(refreshTickets, refreshInterval);
    
    return () => clearInterval(intervalId);
  }, [autoRefresh, refreshInterval, refreshTickets]);

  return {
    tickets,
    stats,
    isLoading,
    error,
    createTicket,
    updateTicket,
    updateTicketStatus,
    fetchTickets,
    refreshTickets,
    clearError,
  };
};