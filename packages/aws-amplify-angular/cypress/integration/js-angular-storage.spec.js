describe('Angular Storage: ', function() {
  before(function() {
    cy.visit('/');
    cy.get('.amplify-signin-username input').type(Cypress.env('COGNITO_SIGN_IN_USERNAME'));
    cy.get('.amplify-signin-password input').type(Cypress.env('COGNITO_SIGN_IN_PASSWORD'));
    cy.contains('button', 'Sign In').click();
    cy.contains('.amplify-greeting-text', `Hello, ${Cypress.env('COGNITO_SIGN_IN_USERNAME')}`);
  });

  describe('Photopicker', () => {
    it('renders a photopicker header by default', () => {
      cy.get('.amplify-photo-picker-container').within(() => {
        cy.contains('.amplify-form-header', 'Select Photos');
      })
    });
  })

  describe('S3 Album', () => {
    it('displays the album container', () => {
      cy.get('.amplify-album-container');
    });
  })

})
