const login = () => {
  cy.get('.amplify-signin-username input').type(Cypress.env('COGNITO_SIGN_IN_USERNAME'));
  cy.get('.amplify-signin-password input').type(Cypress.env('COGNITO_SIGN_IN_PASSWORD'));
  cy.contains('button', 'Sign In').click()
}

export { login };