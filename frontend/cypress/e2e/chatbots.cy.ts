/// <reference types="cypress" />

describe('Chatbots Page', () => {
  beforeEach(() => {
    cy.fixture('chatbots.json').then((chatbots) => {
      cy.intercept('GET', '/chatbots', {
        statusCode: 200,
        body: chatbots,
      }).as('getChatbots');
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
    cy.get('@alert').should('have.been.calledWithMatch', /Chatbot bot1 sent to humpi/);

    cy.contains('Humpa').click();
    cy.get('@alert').should('have.been.calledWithMatch', /Chatbot bot1 sent to humpa/);
  });
});
