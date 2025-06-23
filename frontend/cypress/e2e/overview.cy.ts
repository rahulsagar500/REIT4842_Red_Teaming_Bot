// cypress/e2e/overview.cy.ts
/// <reference types="cypress" />

describe('Overview Page', () => {
  beforeEach(() => {
    cy.intercept('GET', '/chatbots', {
      statusCode: 200,
      body: [
        {
          id: '1',
          name: 'Bot A',
          status: 'active',
          created_at: new Date().toISOString(),
        },
        {
          id: '2',
          name: 'Bot B',
          status: 'trained',
          created_at: new Date().toISOString(),
        },
        {
          id: '3',
          name: 'Bot C',
          status: 'inactive',
          created_at: new Date().toISOString(),
        },
      ],
    }).as('getChatbots');

    cy.visit('/');
  });

  it('shows page title and loading state', () => {
    cy.contains('Chatbot Overview').should('be.visible');
  });

  it('shows chatbot status cards', () => {
    cy.contains('Total Chatbots').should('be.visible');
    cy.contains('3').should('exist');

    cy.contains('Active').should('exist');
    cy.contains('1').should('exist');

    cy.contains('Trained (Not Deployed)').should('exist');
    cy.contains('1').should('exist');
  });

  it('renders recent chatbot list', () => {
    cy.contains('Recent Chatbots').should('be.visible');
    cy.contains('Bot A').should('exist');
    cy.contains('Bot B').should('exist');
    cy.contains('Bot C').should('exist');
  });

  it('renders pie chart placeholder', () => {
    cy.get('canvas').should('have.length', 1);
  });
});
