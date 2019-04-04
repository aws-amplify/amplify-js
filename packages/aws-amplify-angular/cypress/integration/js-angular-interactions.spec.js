import { login } from '../test-utils/cypress-tasks'; 

describe('Angular Interactions: ', function() {
  before(function() {
    cy.visit('/');
    login();
  });

  describe('Chatbot', () => {
    it('should render a chatbot container', () => {
      cy.get('.amplify-interactions-actions');
    });

    it('should render a chatbot container', () => {
      cy.get('.amplify-interactions-actions');
    });

    it('should allow the user to type a message and receive a chat response', () => {

      cy.get('.amplify-interactions-actions input').type('book a trip {enter}', {force: true});
      cy.get('.amplify-interactions-response');
    })
  })

})
