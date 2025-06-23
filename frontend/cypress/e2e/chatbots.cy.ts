/// <reference types="cypress" />

describe('Chatbots Page', () => {
  beforeEach(() => {
    cy.intercept('GET', '/chatbots', {
      statusCode: 200,
      body: [
        {
          id: 'bot1',
          name: 'ChatBot Alpha',
          description: 'Test bot',
          deployment_url: '',
          created_at: new Date().toISOString(),
          last_trained_at: new Date().toISOString(),
          status: 'trained',
        },
      ],
    });

    cy.visit('/chatbots');
  });

  it('displays chatbots in a table', () => {
    cy.contains('ChatBot Alpha').should('exist');
    cy.contains('Test bot').should('exist');
    cy.contains('Trained').should('exist');
    cy.contains('Humpi').should('exist');
    cy.contains('Humpa').should('exist');
  });

  it('handles train and deploy buttons', () => {
    cy.intercept('POST', '/chatbots/bot1/train', { statusCode: 200 }).as('train');
    cy.intercept('POST', '/chatbots/bot1/deploy', { statusCode: 200 }).as('deploy');

    cy.window().then((win) => cy.stub(win, 'alert').as('alert'));
    cy.contains('Humpi').click();
    cy.get('@alert').should('be.calledWithMatch', /Chatbot bot1 sent to humpi/);

    cy.contains('Humpa').click();
    cy.get('@alert').should('be.calledWithMatch', /Chatbot bot1 sent to humpa/);
  });
});
