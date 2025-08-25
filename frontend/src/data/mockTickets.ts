import type { Ticket } from '../types/ticket';

export const mockTickets: Ticket[] = [
  {
    id: 1,
    title: "Login page not working properly",
    description: "When I try to log in with my credentials, the page just keeps loading and never actually logs me in. I've tried clearing my cache and using different browsers but the issue persists.",
    contact_email: "john.doe@example.com",
    contact_phone: "+1 (555) 123-4567",
    status: "pending",
    created_at: "2024-01-15T09:30:00Z",
    updated_at: "2024-01-15T09:30:00Z"
  },
  {
    id: 2,
    title: "Email notifications not being sent",
    description: "I'm not receiving any email notifications for new messages or updates. I've checked my spam folder and email settings, but nothing is coming through.",
    contact_email: "sarah.wilson@company.com",
    contact_phone: "+1 (555) 234-5678",
    status: "accepted",
    created_at: "2024-01-14T14:20:00Z",
    updated_at: "2024-01-16T11:45:00Z"
  },
  {
    id: 3,
    title: "Unable to upload files larger than 10MB",
    description: "The file upload feature fails when trying to upload files larger than 10MB. The progress bar gets stuck at around 80% and then shows an error message.",
    contact_email: "mike.johnson@tech.io",
    status: "resolved",
    created_at: "2024-01-13T16:45:00Z",
    updated_at: "2024-01-17T08:20:00Z"
  },
  {
    id: 4,
    title: "Dashboard loading very slowly",
    description: "The main dashboard takes over 30 seconds to load completely. This is affecting my productivity as I need to access it frequently throughout the day.",
    contact_email: "emma.davis@startup.co",
    contact_phone: "+1 (555) 345-6789",
    status: "accepted",
    created_at: "2024-01-12T10:15:00Z",
    updated_at: "2024-01-16T15:30:00Z"
  },
  {
    id: 5,
    title: "Feature request: Dark mode",
    description: "It would be great to have a dark mode option for the application. Many users work late hours and would appreciate a darker theme that's easier on the eyes.",
    contact_email: "alex.brown@design.com",
    status: "rejected",
    created_at: "2024-01-11T13:22:00Z",
    updated_at: "2024-01-15T12:10:00Z"
  },
  {
    id: 6,
    title: "Search function returns incorrect results",
    description: "When searching for specific items, the search function returns results that don't match the query. Sometimes it returns nothing when there should be matches.",
    contact_email: "lisa.garcia@research.edu",
    contact_phone: "+1 (555) 456-7890",
    status: "pending",
    created_at: "2024-01-16T08:45:00Z",
    updated_at: "2024-01-16T08:45:00Z"
  },
  {
    id: 7,
    title: "Profile picture upload not working",
    description: "I can't update my profile picture. The upload button doesn't respond when clicked, and drag-and-drop functionality also doesn't work.",
    contact_email: "robert.lee@company.org",
    status: "resolved",
    created_at: "2024-01-10T12:30:00Z",
    updated_at: "2024-01-14T16:45:00Z"
  },
  {
    id: 8,
    title: "Mobile app crashes on startup",
    description: "The mobile application crashes immediately after opening. This happens on both iOS and Android devices. I've tried reinstalling but the issue persists.",
    contact_email: "jennifer.white@mobile.app",
    contact_phone: "+1 (555) 567-8901",
    status: "accepted",
    created_at: "2024-01-17T07:20:00Z",
    updated_at: "2024-01-17T14:30:00Z"
  },
  {
    id: 9,
    title: "Password reset email not received",
    description: "I requested a password reset but never received the email. I've checked spam and waited over an hour. My email address is correctly entered.",
    contact_email: "david.kim@business.net",
    status: "pending",
    created_at: "2024-01-17T11:15:00Z",
    updated_at: "2024-01-17T11:15:00Z"
  },
  {
    id: 10,
    title: "Export feature missing data",
    description: "When exporting reports to CSV, some columns are missing data that should be included. The data is visible in the web interface but not in the export.",
    contact_email: "maria.rodriguez@analytics.com",
    contact_phone: "+1 (555) 678-9012",
    status: "resolved",
    created_at: "2024-01-09T15:40:00Z",
    updated_at: "2024-01-13T09:25:00Z"
  }
];