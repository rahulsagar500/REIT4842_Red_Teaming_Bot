// src/components/__tests__/Navbar.test.tsx
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Navbar from '../Navbar';

describe('Navbar', () => {
  it('renders all navigation links', () => {
    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );

    expect(screen.getByText('Overview')).toBeInTheDocument();
    expect(screen.getByText('New Chatbot')).toBeInTheDocument();
    expect(screen.getByText('Chatbots')).toBeInTheDocument();
  });

  it('has correct link destinations', () => {
    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );

    expect(screen.getByText('Overview').closest('a')).toHaveAttribute('href', '/');
    expect(screen.getByText('New Chatbot').closest('a')).toHaveAttribute('href', '/new');
    expect(screen.getByText('Chatbots').closest('a')).toHaveAttribute('href', '/chatbots');
  });
});