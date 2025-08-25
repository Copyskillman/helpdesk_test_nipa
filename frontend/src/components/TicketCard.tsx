import React from 'react';
import type { Ticket, TicketStatus } from '../types/ticket';
import { TICKET_STATUS_LABELS, TICKET_STATUS_COLORS } from '../types/ticket';

interface TicketCardProps {
  ticket: Ticket;
  onEdit: (ticket: Ticket) => void;
  onStatusChange: (ticketId: number, status: TicketStatus) => void;
}

const TicketCard: React.FC<TicketCardProps> = ({ ticket, onEdit, onStatusChange }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

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

  const handleStatusChange = (newStatus: TicketStatus) => {
    if (newStatus !== ticket.status) {
      onStatusChange(ticket.id, newStatus);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow duration-200">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-gray-900 text-sm">#{ticket.id}</h3>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${TICKET_STATUS_COLORS[ticket.status]}`}>
            {TICKET_STATUS_LABELS[ticket.status]}
          </span>
        </div>
        <button
          onClick={() => onEdit(ticket)}
          className="text-gray-400 hover:text-gray-600 transition-colors"
          title="Edit ticket"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
      </div>

      <h4 className="font-medium text-gray-800 mb-2 line-clamp-2">{ticket.title}</h4>
      
      <p className="text-gray-600 text-sm mb-3 line-clamp-3">{ticket.description}</p>

      <div className="space-y-2 mb-3">
        <div className="flex items-center text-xs text-gray-500">
          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
          </svg>
          {ticket.contact_email}
        </div>
        {ticket.contact_phone && (
          <div className="flex items-center text-xs text-gray-500">
            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            {ticket.contact_phone}
          </div>
        )}
      </div>

      <div className="flex justify-between items-center text-xs text-gray-400">
        <div>
          <div>Created: {formatDate(ticket.created_at)}</div>
          <div>Updated: {getTimeDifference(ticket.updated_at)}</div>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-gray-100">
        <div className="flex gap-1">
          {(['pending', 'accepted', 'resolved', 'rejected'] as TicketStatus[]).map((status) => (
            <button
              key={status}
              onClick={() => handleStatusChange(status)}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                ticket.status === status
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-transparent'
              }`}
              disabled={ticket.status === status}
            >
              {TICKET_STATUS_LABELS[status]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TicketCard;