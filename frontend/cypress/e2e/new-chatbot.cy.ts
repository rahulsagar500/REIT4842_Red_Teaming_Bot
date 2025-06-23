/// <reference types="cypress" />

describe('NewChatbot Page', () => {
  beforeEach(() => {
    cy.intercept('GET', 'http://localhost:5000/api/testsets', {
      statusCode: 200,
      body: [
        {
          id: 'meta-123',
          name: 'Demo Testset',
          description: '',
          created_at: new Date().toISOString(),
        },
      ],
    }).as('getTestsets');

    cy.visit('/new');
  });

  it('shows the create form', () => {
    cy.contains('Create a New Chatbot').should('be.visible');
    cy.get('input[placeholder="Enter chatbot name"]').should('exist');
    cy.get('select').should('exist');
    cy.contains('Create Chatbot').should('be.enabled');
  });

  it('validates required fields', () => {
    cy.contains('Create Chatbot').click();
    cy.contains(/please select a testset/i).should('exist');
  });

  it('submits and creates chatbot', () => {
    cy.get('input').type('MyChatbot');
    cy.get('select').select('Demo Testset');
    cy.intercept('POST', 'http://localhost:5000/chatbots/create', {
      statusCode: 200,
      body: { chatbot_id: 'abc-001' },
    }).as('createChatbot');

    cy.contains('Create Chatbot').click();
    cy.contains(/chatbot created/i).should('exist');
  });
});
