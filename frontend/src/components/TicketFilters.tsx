import React from 'react';
import type { TicketStatus } from '../types/ticket';
import { TICKET_STATUS_LABELS } from '../types/ticket';

export type SortOption = 'updated_desc' | 'updated_asc' | 'created_desc' | 'created_asc' | 'title_asc' | 'title_desc';

interface TicketFiltersProps {
  statusFilter: TicketStatus | 'all';
  sortBy: SortOption;
  searchQuery: string;
  onStatusFilterChange: (status: TicketStatus | 'all') => void;
  onSortChange: (sort: SortOption) => void;
  onSearchChange: (query: string) => void;
  ticketCount: number;
}

const TicketFilters: React.FC<TicketFiltersProps> = ({
  statusFilter,
  sortBy,
  searchQuery,
  onStatusFilterChange,
  onSortChange,
  onSearchChange,
  ticketCount,
}) => {
  const sortOptions: { value: SortOption; label: string }[] = [
    { value: 'updated_desc', label: 'Latest Update' },
    { value: 'updated_asc', label: 'Oldest Update' },
    { value: 'created_desc', label: 'Newest Created' },
    { value: 'created_asc', label: 'Oldest Created' },
    { value: 'title_asc', label: 'Title A-Z' },
    { value: 'title_desc', label: 'Title Z-A' },
  ];

  const statusOptions: { value: TicketStatus | 'all'; label: string }[] = [
    { value: 'all', label: 'All Status' },
    { value: 'pending', label: TICKET_STATUS_LABELS.pending },
    { value: 'accepted', label: TICKET_STATUS_LABELS.accepted },
    { value: 'resolved', label: TICKET_STATUS_LABELS.resolved },
    { value: 'rejected', label: TICKET_STATUS_LABELS.rejected },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center flex-1">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search tickets..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value as TicketStatus | 'all')}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as SortOption)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  Sort by {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">
            {ticketCount} ticket{ticketCount !== 1 ? 's' : ''} found
          </span>
        </div>
      </div>
    </div>
  );
};

export default TicketFilters;