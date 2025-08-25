import apiService from './api';
import type { Ticket, CreateTicketData, UpdateTicketData, TicketStatus } from '../types/ticket';

export interface TicketListParams {
  status?: TicketStatus | 'all';
  search?: string;
  ordering?: string;
  page?: number;
  page_size?: number;
}

export interface TicketStats {
  total: number;
  pending: number;
  accepted: number;
  resolved: number;
  rejected: number;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

class TicketService {
  private readonly TICKETS_ENDPOINT = '/tickets/';
  private readonly STATS_ENDPOINT = '/tickets/stats/';

  async getTickets(params: TicketListParams = {}): Promise<Ticket[]> {
    try {
      const queryParams: Record<string, string> = {};
      
      if (params.status && params.status !== 'all') {
        queryParams.status = params.status;
      }
      
      if (params.search && params.search.trim()) {
        queryParams.search = params.search.trim();
      }
      
      if (params.ordering) {
        queryParams.ordering = params.ordering;
      }

      const response = await apiService.get<PaginatedResponse<Ticket>>(this.TICKETS_ENDPOINT, queryParams);
      
      // Handle paginated response from Django REST Framework
      if (response.data && response.data.results) {
        return response.data.results;
      }
      
      // Fallback for direct array response (if API changes)
      if (Array.isArray(response.data)) {
        return response.data;
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching tickets:', error);
      throw new Error('Failed to fetch tickets');
    }
  }

  async getTicket(id: number): Promise<Ticket> {
    try {
      const response = await apiService.get<Ticket>(`${this.TICKETS_ENDPOINT}${id}/`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching ticket ${id}:`, error);
      throw new Error(`Failed to fetch ticket ${id}`);
    }
  }

  async createTicket(ticketData: CreateTicketData): Promise<Ticket> {
    try {
      const response = await apiService.post<Ticket>(this.TICKETS_ENDPOINT, ticketData);
      return response.data;
    } catch (error) {
      console.error('Error creating ticket:', error);
      
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as any;
        if (axiosError.response?.status === 400 && axiosError.response?.data) {
          const validationErrors = axiosError.response.data;
          throw new Error(`Validation failed: ${JSON.stringify(validationErrors)}`);
        }
      }
      
      throw new Error('Failed to create ticket');
    }
  }

  async updateTicket(id: number, ticketData: UpdateTicketData): Promise<Ticket> {
    try {
      const response = await apiService.patch<Ticket>(`${this.TICKETS_ENDPOINT}${id}/`, ticketData);
      return response.data;
    } catch (error) {
      console.error(`Error updating ticket ${id}:`, error);
      
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as any;
        if (axiosError.response?.status === 400 && axiosError.response?.data) {
          const validationErrors = axiosError.response.data;
          throw new Error(`Validation failed: ${JSON.stringify(validationErrors)}`);
        }
        if (axiosError.response?.status === 404) {
          throw new Error(`Ticket ${id} not found`);
        }
      }
      
      throw new Error(`Failed to update ticket ${id}`);
    }
  }

  async updateTicketStatus(id: number, status: TicketStatus): Promise<Ticket> {
    try {
      const response = await apiService.patch<Ticket>(`${this.TICKETS_ENDPOINT}${id}/`, { status });
      return response.data;
    } catch (error) {
      console.error(`Error updating ticket ${id} status:`, error);
      
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as any;
        if (axiosError.response?.status === 404) {
          throw new Error(`Ticket ${id} not found`);
        }
      }
      
      throw new Error(`Failed to update ticket ${id} status`);
    }
  }

  async getTicketStats(): Promise<TicketStats> {
    try {
      const response = await apiService.get<TicketStats>(this.STATS_ENDPOINT);
      return response.data;
    } catch (error) {
      console.error('Error fetching ticket stats:', error);
      throw new Error('Failed to fetch ticket statistics');
    }
  }

  // Helper method to build sorting parameter for API
  buildOrderingParam(sortBy: string): string {
    const sortMap: Record<string, string> = {
      'updated_desc': '-updated_at',
      'updated_asc': 'updated_at', 
      'created_desc': '-created_at',
      'created_asc': 'created_at',
      'title_asc': 'title',
      'title_desc': '-title',
    };
    
    return sortMap[sortBy] || '-updated_at';
  }
}

export const ticketService = new TicketService();
export default ticketService;