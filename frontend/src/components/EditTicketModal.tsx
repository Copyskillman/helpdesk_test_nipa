import React, { useState, useEffect } from 'react';
import type { Ticket, UpdateTicketData, TicketStatus } from '../types/ticket';
import { TICKET_STATUS_LABELS } from '../types/ticket';

interface EditTicketModalProps {
  ticket: Ticket | null;
  onSave: (ticketId: number, data: UpdateTicketData) => Promise<void>;
  onCancel: () => void;
  isOpen: boolean;
}

const EditTicketModal: React.FC<EditTicketModalProps> = ({ 
  ticket, 
  onSave, 
  onCancel, 
  isOpen 
}) => {
  const [formData, setFormData] = useState<UpdateTicketData>({
    title: '',
    description: '',
    contact_email: '',
    contact_phone: '',
    status: 'pending',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof UpdateTicketData, string>>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (ticket) {
      setFormData({
        title: ticket.title,
        description: ticket.description,
        contact_email: ticket.contact_email,
        contact_phone: ticket.contact_phone || '',
        status: ticket.status,
      });
      setErrors({});
    }
  }, [ticket]);

  const validateForm = () => {
    const newErrors: Partial<Record<keyof UpdateTicketData, string>> = {};

    if (!formData.title?.trim() || formData.title.trim().length < 3) {
      newErrors.title = 'Title must be at least 3 characters long';
    }

    if (!formData.description?.trim() || formData.description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters long';
    }

    if (!formData.contact_email?.trim()) {
      newErrors.contact_email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contact_email)) {
      newErrors.contact_email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticket || !validateForm()) return;

    setIsSaving(true);
    setErrors({});

    try {
      const updateData: UpdateTicketData = {
        title: formData.title?.trim(),
        description: formData.description?.trim(),
        contact_email: formData.contact_email?.trim(),
        contact_phone: formData.contact_phone?.trim() || undefined,
        status: formData.status,
      };

      await onSave(ticket.id, updateData);
    } catch (error) {
      console.error('Failed to update ticket:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (ticket) {
      setFormData({
        title: ticket.title,
        description: ticket.description,
        contact_email: ticket.contact_email,
        contact_phone: ticket.contact_phone || '',
        status: ticket.status,
      });
    }
    setErrors({});
    onCancel();
  };

  if (!isOpen || !ticket) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Edit Ticket #{ticket.id}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="edit-title" className="block text-sm font-medium text-gray-700 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="edit-title"
              value={formData.title || ''}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.title ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Brief description of the issue"
            />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
          </div>

          <div>
            <label htmlFor="edit-description" className="block text-sm font-medium text-gray-700 mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="edit-description"
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Detailed description of the issue"
            />
            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
          </div>

          <div>
            <label htmlFor="edit-contact_email" className="block text-sm font-medium text-gray-700 mb-1">
              Contact Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="edit-contact_email"
              value={formData.contact_email || ''}
              onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.contact_email ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="your.email@example.com"
            />
            {errors.contact_email && <p className="text-red-500 text-xs mt-1">{errors.contact_email}</p>}
          </div>

          <div>
            <label htmlFor="edit-contact_phone" className="block text-sm font-medium text-gray-700 mb-1">
              Contact Phone (Optional)
            </label>
            <input
              type="tel"
              id="edit-contact_phone"
              value={formData.contact_phone || ''}
              onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="+1 (555) 123-4567"
            />
          </div>

          <div>
            <label htmlFor="edit-status" className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              id="edit-status"
              value={formData.status || 'pending'}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as TicketStatus })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Object.entries(TICKET_STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div className="bg-gray-50 p-3 rounded-md text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Created:</span>
              <span>{new Date(ticket.created_at).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Last Updated:</span>
              <span>{new Date(ticket.updated_at).toLocaleString()}</span>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-md transition duration-200 flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Ticket'
              )}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSaving}
              className="flex-1 bg-gray-300 hover:bg-gray-400 disabled:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-md transition duration-200"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTicketModal;