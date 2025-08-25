import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TicketCard from '../../components/TicketCard';
import type { Ticket, TicketStatus } from '../../types/ticket';

// Mock ticket data
const mockTicket: Ticket = {
  id: 1,
  title: 'Test Ticket Title',
  description: 'This is a test ticket description for testing purposes.',
  contact_email: 'test@example.com',
  contact_phone: '+1234567890',
  status: 'pending' as TicketStatus,
  created_at: '2025-08-25T10:30:00Z',
  updated_at: '2025-08-25T14:45:00Z',
};

const mockTicketWithoutPhone: Ticket = {
  ...mockTicket,
  id: 2,
  contact_phone: null,
};

describe('TicketCard', () => {
  const mockOnEdit = jest.fn();
  const mockOnStatusChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders ticket information correctly', () => {
    render(
      <TicketCard
        ticket={mockTicket}
        onEdit={mockOnEdit}
        onStatusChange={mockOnStatusChange}
      />
    );

    expect(screen.getByText('#1')).toBeInTheDocument();
    expect(screen.getByText('Test Ticket Title')).toBeInTheDocument();
    expect(screen.getByText('This is a test ticket description for testing purposes.')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
    expect(screen.getByText('+1234567890')).toBeInTheDocument();
    expect(screen.getAllByText('Pending')).toHaveLength(2);
  });

  it('renders ticket without phone number', () => {
    render(
      <TicketCard
        ticket={mockTicketWithoutPhone}
        onEdit={mockOnEdit}
        onStatusChange={mockOnStatusChange}
      />
    );

    expect(screen.getByText('test@example.com')).toBeInTheDocument();
    expect(screen.queryByText('+1234567890')).not.toBeInTheDocument();
  });

  it('disables current status button', () => {
    render(
      <TicketCard
        ticket={mockTicket}
        onEdit={mockOnEdit}
        onStatusChange={mockOnStatusChange}
      />
    );

    const pendingButton = screen.getByRole('button', { name: 'Pending' });
    expect(pendingButton).toBeDisabled();
    
    const acceptedButton = screen.getByRole('button', { name: 'Accepted' });
    expect(acceptedButton).not.toBeDisabled();
  });

  it('shows basic date display', () => {
    render(
      <TicketCard
        ticket={mockTicket}
        onEdit={mockOnEdit}
        onStatusChange={mockOnStatusChange}
      />
    );

    expect(screen.getByText(/Created:/)).toBeInTheDocument();
    expect(screen.getByText(/Updated:/)).toBeInTheDocument();
  });

  it('calls onEdit when edit button is clicked', async () => {
    const user = userEvent.setup();
    
    render(
      <TicketCard
        ticket={mockTicket}
        onEdit={mockOnEdit}
        onStatusChange={mockOnStatusChange}
      />
    );

    const editButton = screen.getByRole('button', { name: 'Edit ticket' });
    await user.click(editButton);

    expect(mockOnEdit).toHaveBeenCalledTimes(1);
    expect(mockOnEdit).toHaveBeenCalledWith(mockTicket);
  });

  it('calls onStatusChange when status button is clicked', async () => {
    const user = userEvent.setup();
    
    render(
      <TicketCard
        ticket={mockTicket}
        onEdit={mockOnEdit}
        onStatusChange={mockOnStatusChange}
      />
    );

    const acceptedButton = screen.getByRole('button', { name: 'Accepted' });
    await user.click(acceptedButton);

    expect(mockOnStatusChange).toHaveBeenCalledTimes(1);
    expect(mockOnStatusChange).toHaveBeenCalledWith(1, 'accepted');
  });
});