import { login } from '../test-utils/cypress-tasks'; 

describe('Angular Storage: ', function() {
  before(function() {
    cy.visit('/');
    login();
  });

  describe('Photopicker', () => {
    it('renders a photopicker header by default', () => {
      cy.contains('.amplify-form-header', 'Select Photos');
    });
  })

  describe('S3 Album', () => {
    it('displays the album container', () => {
      cy.get('.amplify-album-container');
    });
  })

})
