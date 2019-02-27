describe('Angular Storage: ', function() {
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

  describe('Photopicker', () => {
    it('renders a photopicker header by default', () => {
      cy.get('.amplify-form-header').contains('Select Photos');
    });
  })

  describe('S3 Album', () => {
    it('displays the album container', () => {
      cy.get('.amplify-album-container');
    });
  })

})
