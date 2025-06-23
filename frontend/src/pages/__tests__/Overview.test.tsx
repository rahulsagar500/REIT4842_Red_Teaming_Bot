// src/pages/__tests__/Overview.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import Overview from '../Overview';
import { fetchWithCSRF } from '../../utils/csrfLoader';

jest.mock('../../utils/csrfLoader');
const mockFetchWithCSRF = fetchWithCSRF as jest.Mock;

describe('Overview page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('displays loading state initially', () => {
    render(<Overview />);
    expect(screen.getByText(/loading chatbot overview/i)).toBeInTheDocument();
  });

  it('renders chatbot overview with status counts and recent list', async () => {
    const now = new Date().toISOString();
    mockFetchWithCSRF.mockResolvedValueOnce({
      json: async () => [
        { id: '1', name: 'Bot A', status: 'active', created_at: now },
        { id: '2', name: 'Bot B', status: 'trained', created_at: now },
        { id: '3', name: 'Bot C', status: 'inactive', created_at: now },
        { id: '4', name: 'Bot D', status: 'active', created_at: now },
      ],
    });

    render(<Overview />);

    await waitFor(() => {
      expect(screen.getByText('Chatbot Overview')).toBeInTheDocument();
    });

    expect(screen.getByText('Total Chatbots')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument(); // total count

    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument(); // active count

    expect(screen.getByText(/trained \(not deployed\)/i)).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument(); // trained count

    expect(screen.getByText('Bot A')).toBeInTheDocument();
    expect(screen.getByText('Bot B')).toBeInTheDocument();
    expect(screen.getByText('Bot C')).toBeInTheDocument();
    expect(screen.getByText('Bot D')).toBeInTheDocument();

    expect(screen.getByText(/status distribution/i)).toBeInTheDocument();
  });
});
