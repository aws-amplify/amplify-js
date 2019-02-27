describe('Angular Interactions: ', function() {
  before(function() {
    cy.visit('/');
    cy.get('.amplify-signin-username').within(() => {
      cy.get('input').type(Cypress.env('COGNITO_SIGN_IN_USERNAME'));
    })
    cy.get('.amplify-signin-password').within(() => {
      cy.get('input').type(Cypress.env('COGNITO_SIGN_IN_PASSWORD'));
    })
    cy.get('button').contains('Sign In').click()

    cy.wait(500);
  });

  describe('Chatbot', () => {
    it('should render a chatbot container', () => {
      cy.get('.amplify-interactions-actions');
    });

    it('should render a chatbot container', () => {
      cy.get('.amplify-interactions-actions');
    });

    it('should allow the user to type a message and receive a chat response', () => {


      cy.get('.amplify-interactions-actions').within(() => {
        cy.get('input').type('book a trip {enter}', {force: true});
      });
      cy.get('.amplify-interactions-button').click();
      cy.wait(1000);
      cy.get('.amplify-interactions-response');
    })
  })

})
