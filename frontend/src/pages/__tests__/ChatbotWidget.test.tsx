// src/pages/__tests__/ChatbotWidget.test.tsx
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ChatWidget from '../ChatbotWidget';

describe('ChatWidget', () => {
  it('renders chatbotId from route params', () => {
    render(
      <MemoryRouter initialEntries={['/chat/test-bot-42']}>
        <Routes>
          <Route path="/chat/:chatbotId" element={<ChatWidget />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText(/chatbot widget: test-bot-42/i)).toBeInTheDocument();
    expect(screen.getByText(/hello! this is chatbot/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue('')).toHaveAttribute('placeholder', 'Type a message...');
  });
});