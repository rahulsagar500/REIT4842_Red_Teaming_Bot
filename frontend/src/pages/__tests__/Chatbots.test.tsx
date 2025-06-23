// src/pages/__tests__/Chatbots.test.tsx
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import Chatbots from '../Chatbots';
import { fetchWithCSRF } from '../../utils/csrfLoader';

jest.mock('../../utils/csrfLoader');

// Type it safely
const mockFetchWithCSRF = fetchWithCSRF as jest.Mock;

describe('Chatbots component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('displays loading state initially', () => {
    render(<Chatbots />);
    expect(screen.getByText(/loading chatbots/i)).toBeInTheDocument();
  });

  it('displays error message on fetch failure', async () => {
    mockFetchWithCSRF.mockRejectedValueOnce(new Error('Network error'));
    render(<Chatbots />);
    await waitFor(() => {
      expect(screen.getByText(/error: network error/i)).toBeInTheDocument();
    });
  });

  it('renders chatbot table on successful fetch', async () => {
    mockFetchWithCSRF.mockResolvedValueOnce({
      json: async () => [
        {
          id: 'abc123',
          name: 'TestBot',
          description: 'A test chatbot',
          deployment_url: '',
          created_at: new Date().toISOString(),
          last_trained_at: new Date().toISOString(),
          status: 'trained',
        },
      ],
    });

    render(<Chatbots />);

    expect(screen.getByText(/loading chatbots/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('TestBot')).toBeInTheDocument();
      expect(screen.getByText('A test chatbot')).toBeInTheDocument();
      expect(screen.getByText(/trained/i)).toBeInTheDocument();
    });
  });

  it('handles Humpi (train) button click', async () => {
    window.alert = jest.fn(); // mock alert

    mockFetchWithCSRF.mockResolvedValueOnce({
      json: async () => [
        {
          id: 'abc123',
          name: 'TestBot',
          description: 'A test chatbot',
          deployment_url: '',
          created_at: new Date().toISOString(),
          last_trained_at: new Date().toISOString(),
          status: 'trained',
        },
      ],
    });

    render(<Chatbots />);
    await waitFor(() => screen.getByText('Humpi'));

    mockFetchWithCSRF.mockResolvedValueOnce({}); // simulate POST success
    fireEvent.click(screen.getByText('Humpi'));

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('Chatbot abc123 sent to humpi'));
    });
  });

  it('handles Humpa (deploy) button click', async () => {
    window.alert = jest.fn();

    mockFetchWithCSRF.mockResolvedValueOnce({
      json: async () => [
        {
          id: 'abc123',
          name: 'TestBot',
          description: 'A test chatbot',
          deployment_url: '',
          created_at: new Date().toISOString(),
          last_trained_at: new Date().toISOString(),
          status: 'trained',
        },
      ],
    });

    render(<Chatbots />);
    await waitFor(() => screen.getByText('Humpa'));

    mockFetchWithCSRF.mockResolvedValueOnce({}); // simulate POST success
    fireEvent.click(screen.getByText('Humpa'));

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('Chatbot abc123 sent to humpa'));
    });
  });
});
