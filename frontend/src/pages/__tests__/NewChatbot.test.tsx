// src/pages/__tests__/NewChatbot.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import NewChatbot from '../NewChatbot';
import { fetchWithCSRF } from '../../utils/csrfLoader';

jest.mock('../../utils/csrfLoader');
const mockFetchWithCSRF = fetchWithCSRF as jest.Mock;

describe('NewChatbot', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('loads and displays testsets in dropdown', async () => {
    mockFetchWithCSRF.mockResolvedValueOnce({
      json: async () => [
        { id: '123', name: 'Testset A', created_at: new Date().toISOString() },
      ],
    });

    render(<NewChatbot />);

    await waitFor(() => {
      expect(screen.getByText(/testset a/i)).toBeInTheDocument();
    });
  });

  it('shows error if form submitted without name or testset', async () => {
    render(<NewChatbot />);

    const submitBtn = screen.getByRole('button', { name: /create chatbot/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/please select a testset/i)).toBeInTheDocument();
    });
  });

  it('submits form and shows success message', async () => {
    // First call: load testsets
    mockFetchWithCSRF.mockResolvedValueOnce({
      json: async () => [
        { id: '123', name: 'Testset A', created_at: new Date().toISOString() },
      ],
    });

    render(<NewChatbot />);

    await waitFor(() => screen.getByText(/testset a/i));

    fireEvent.change(screen.getByPlaceholderText(/enter chatbot name/i), {
      target: { value: 'TestBot' },
    });
    fireEvent.change(screen.getByLabelText(/select testset/i), {
      target: { value: '123' },
    });

    // Second call: submit chatbot
    mockFetchWithCSRF.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ chatbot_id: 'abc123' }),
    });

    fireEvent.click(screen.getByRole('button', { name: /create chatbot/i }));

    await waitFor(() => {
      expect(screen.getByText(/✅ chatbot created/i)).toBeInTheDocument();
    });
  });

  it('shows error on chatbot creation failure', async () => {
    // Load testsets
    mockFetchWithCSRF.mockResolvedValueOnce({
      json: async () => [
        { id: '123', name: 'Testset A', created_at: new Date().toISOString() },
      ],
    });

    render(<NewChatbot />);
    await waitFor(() => screen.getByText(/testset a/i));

    fireEvent.change(screen.getByPlaceholderText(/enter chatbot name/i), {
      target: { value: 'FailBot' },
    });
    fireEvent.change(screen.getByLabelText(/select testset/i), {
      target: { value: '123' },
    });

    // Submit chatbot fails
    mockFetchWithCSRF.mockResolvedValueOnce({
      ok: false,
      text: async () => 'Creation failed',
    });

    fireEvent.click(screen.getByRole('button', { name: /create chatbot/i }));

    await waitFor(() => {
      expect(screen.getByText(/creation failed/i)).toBeInTheDocument();
    });
  });
});
