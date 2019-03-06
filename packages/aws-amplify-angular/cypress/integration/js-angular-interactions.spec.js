describe('Angular Interactions: ', function() {
  before(function() {
    cy.visit('/');
    cy.get('.amplify-signin-username input').type(Cypress.env('COGNITO_SIGN_IN_USERNAME'));
    cy.get('.amplify-signin-password input').type(Cypress.env('COGNITO_SIGN_IN_PASSWORD'));
    cy.contains('button', 'Sign In').click()
    cy.contains('.amplify-greeting-text', `Hello, ${Cypress.env('COGNITO_SIGN_IN_USERNAME')}`);
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
      cy.get('.amplify-interactions-button').click();
      cy.get('.amplify-interactions-response');
    })
  })

})
