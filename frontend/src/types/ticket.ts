export type TicketStatus = 'pending' | 'accepted' | 'resolved' | 'rejected';

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

export interface CreateTicketData {
  title: string;
  description: string;
  contact_email: string;
  contact_phone?: string;
}

export interface UpdateTicketData {
  title?: string;
  description?: string;
  contact_email?: string;
  contact_phone?: string;
  status?: TicketStatus;
}

export const TICKET_STATUS_LABELS: Record<TicketStatus, string> = {
  pending: 'Pending',
  accepted: 'Accepted',
  resolved: 'Resolved',
  rejected: 'Rejected',
};

export const TICKET_STATUS_COLORS: Record<TicketStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  accepted: 'bg-blue-100 text-blue-800 border-blue-200',
  resolved: 'bg-green-100 text-green-800 border-green-200',
  rejected: 'bg-red-100 text-red-800 border-red-200',
};

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
  status?: number;
}

export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

export interface TicketsState extends LoadingState {
  tickets: Ticket[];
  stats?: {
    total: number;
    pending: number;
    accepted: number;
    resolved: number;
    rejected: number;
  };
}