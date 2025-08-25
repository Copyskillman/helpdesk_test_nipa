import React from "react";
import type { Ticket, TicketStatus } from "../types/ticket";
import { TICKET_STATUS_LABELS } from "../types/ticket";
import TicketCard from "./TicketCard";

interface KanbanBoardProps {
  tickets: Ticket[];
  onEditTicket: (ticket: Ticket) => void;
  onStatusChange: (ticketId: number, status: TicketStatus) => void;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({
  tickets = [],
  onEditTicket,
  onStatusChange,
}) => {
  const statusColumns: TicketStatus[] = [
    "pending",
    "accepted",
    "resolved",
    "rejected",
  ];

  const getTicketsByStatus = (status: TicketStatus) => {
    if (!Array.isArray(tickets)) {
      return [];
    }
    return tickets.filter((ticket) => ticket.status === status);
  };

  const getColumnColor = (status: TicketStatus) => {
    const colors = {
      pending: "border-yellow-200 bg-yellow-50",
      accepted: "border-blue-200 bg-blue-50",
      resolved: "border-green-200 bg-green-50",
      rejected: "border-red-200 bg-red-50",
    };
    return colors[status];
  };

  const getHeaderColor = (status: TicketStatus) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      accepted: "bg-blue-100 text-blue-800",
      resolved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
    };
    return colors[status];
  };

  return (
    <div className="flex gap-6 h-full overflow-x-auto pb-6">
      {statusColumns.map((status) => {
        const columnTickets = getTicketsByStatus(status);

        return (
          <div
            key={status}
            className={`flex-shrink-0 w-85 border-2 rounded-lg shadow-lg ${getColumnColor(
              status
            )}`}
          >
            <div
              className={`p-4 rounded-t-lg border-b-2 border-current ${getHeaderColor(
                status
              )}`}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">
                  {TICKET_STATUS_LABELS[status]}
                </h3>
                <span className="bg-white bg-opacity-50 px-2 py-1 rounded-full text-sm font-medium">
                  {columnTickets.length}
                </span>
              </div>
            </div>

            <div className="p-4 space-y-4 min-h-[200px] max-h-[calc(100vh-200px)] overflow-y-auto">
              {columnTickets.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                  <svg
                    className="w-12 h-12 mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                    />
                  </svg>
                  <p className="text-center text-sm">
                    No tickets in {TICKET_STATUS_LABELS[status].toLowerCase()}
                  </p>
                </div>
              ) : (
                columnTickets.map((ticket) => (
                  <TicketCard
                    key={ticket.id}
                    ticket={ticket}
                    onEdit={onEditTicket}
                    onStatusChange={onStatusChange}
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default KanbanBoard;
