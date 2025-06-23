// App.test.jsx
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '../App';

describe('App routing', () => {
  it('renders Overview page at root path', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByText(/overview/i)).toBeInTheDocument();
  });

  it('renders NewChatbot page at /new', () => {
    render(
      <MemoryRouter initialEntries={['/new']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByText(/new chatbot/i)).toBeInTheDocument();
  });

  it('renders Chatbots page at /chatbots', () => {
    render(
      <MemoryRouter initialEntries={['/chatbots']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByText(/chatbots/i)).toBeInTheDocument();
  });

  it('renders ChatWidget for dynamic chat route', () => {
    render(
      <MemoryRouter initialEntries={['/chat/123']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByText(/chatwidget/i)).toBeInTheDocument(); // replace with an actual element from ChatWidget
  });
});