import React, { useState, useMemo, useEffect } from 'react';
import type { Ticket, CreateTicketData, UpdateTicketData, TicketStatus } from './types/ticket';
import TicketForm from './components/TicketForm';
import TicketFilters from './components/TicketFilters';
import type { SortOption } from './components/TicketFilters';
import KanbanBoard from './components/KanbanBoard';
import EditTicketModal from './components/EditTicketModal';
import { useTickets } from './hooks/useTickets';
import ticketService from './services/ticketService';

function App() {
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);
  const [statusFilter, setStatusFilter] = useState<TicketStatus | 'all'>('all');
  const [sortBy, setSortBy] = useState<SortOption>('updated_desc');
  const [searchQuery, setSearchQuery] = useState('');

  const {
    tickets,
    isLoading,
    error,
    createTicket: createTicketApi,
    updateTicket: updateTicketApi,
    updateTicketStatus: updateTicketStatusApi,
    fetchTickets,
    clearError,
  } = useTickets();

  const createTicket = async (data: CreateTicketData) => {
    try {
      await createTicketApi(data);
      setIsCreateFormOpen(false);
    } catch (err) {
      console.error('Failed to create ticket:', err);
    }
  };

  const updateTicket = async (ticketId: number, data: UpdateTicketData) => {
    try {
      await updateTicketApi(ticketId, data);
      setEditingTicket(null);
    } catch (err) {
      console.error('Failed to update ticket:', err);
    }
  };

  const updateTicketStatus = async (ticketId: number, status: TicketStatus) => {
    try {
      await updateTicketStatusApi(ticketId, status);
    } catch (err) {
      console.error('Failed to update ticket status:', err);
    }
  };

  // Use server-side filtering and sorting instead of client-side
  useEffect(() => {
    const fetchFilteredTickets = async () => {
      const params = {
        status: statusFilter,
        search: searchQuery,
        ordering: ticketService.buildOrderingParam(sortBy),
      };
      
      await fetchTickets(params);
    };

    fetchFilteredTickets();
  }, [statusFilter, sortBy, searchQuery, fetchTickets]);

  const filteredAndSortedTickets = tickets;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex justify-between items-center">
            <span>{error}</span>
            <button
              onClick={clearError}
              className="text-red-500 hover:text-red-700"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Help Desk</h1>
            <p className="text-gray-600 mt-1">Manage and track support tickets</p>
          </div>
          <button
            onClick={() => setIsCreateFormOpen(true)}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-lg transition duration-200 flex items-center gap-2"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            )}
            New Ticket
          </button>
        </div>

        <TicketFilters
          statusFilter={statusFilter}
          sortBy={sortBy}
          searchQuery={searchQuery}
          onStatusFilterChange={setStatusFilter}
          onSortChange={setSortBy}
          onSearchChange={setSearchQuery}
          ticketCount={filteredAndSortedTickets.length}
        />

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <span className="text-gray-600">Loading tickets...</span>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <KanbanBoard
              tickets={filteredAndSortedTickets}
              onEditTicket={setEditingTicket}
              onStatusChange={updateTicketStatus}
            />
          </div>
        )}

        <TicketForm
          onSubmit={createTicket}
          onCancel={() => setIsCreateFormOpen(false)}
          isOpen={isCreateFormOpen}
        />

        <EditTicketModal
          ticket={editingTicket}
          onSave={updateTicket}
          onCancel={() => setEditingTicket(null)}
          isOpen={!!editingTicket}
        />
      </div>
    </div>
  );
}

export default App;
