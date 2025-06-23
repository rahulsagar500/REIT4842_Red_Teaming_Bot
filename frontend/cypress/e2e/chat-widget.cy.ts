/// <reference types="cypress" />

describe('ChatWidget Page', () => {
  it('renders with chatbotId from route', () => {
    cy.visit('/chat/my-bot-123');
    cy.contains(/chatbot widget: my-bot-123/i).should('exist');
    cy.contains(/hello! this is chatbot/i).should('exist');
    cy.get('input[placeholder="Type a message..."]').should('exist');
  });
});
