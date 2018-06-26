describe('withAuthenticator Sign In', function() {
  beforeEach(function() {
    cy.visit('/')
  })

  it('successfully signs in and out', function() {
    // Check for sign in page header
    cy.get('.amplify-section-header').contains('Sign In Account')
    
    // Sign in
    cy.get('input[name=username]').type(Cypress.env('COGNITO_SIGN_IN_USERNAME'))
    cy.get('input[name=password]').type(Cypress.env('COGNITO_SIGN_IN_PASSWORD'))
    cy.get('.amplify-button').contains('Sign In').click()
    
    // Wait 1 second for sign in to load
    cy.wait(1000)

    // Check for signed in page
    cy.get('.App-title').contains('Welcome to React')
    cy.get('.amplify-nav-item').contains('Hello ' + Cypress.env('COGNITO_SIGN_IN_USERNAME'))
    
    // Sign out
    cy.get('.amplify-nav-button').contains('Sign Out').click()

    // Check if successfully signed out
    cy.get('.amplify-section-header').contains('Sign In Account')
  })

  it('throws validation errors if username or password is incorrect', function() {
    // Check for empty username error
    cy.get('.amplify-button').contains('Sign In').click()
    cy.get('.amplify-error-section').contains('Username cannot be empty')

    // Check for empty password error
    cy.get('input[name=username]').type('invalidUsername')
    cy.get('.amplify-button').contains('Sign In').click()
    cy.get('.amplify-error-section').contains('User does not exist')

    // Check invalid username error
    cy.get('input[name=password]').type('invalidPassword')
    cy.get('.amplify-button').contains('Sign In').click()
    cy.get('.amplify-error-section').contains('User does not exist')

    // Check correct username but incorrect password error
    cy.get('input[name=username]').clear().type(Cypress.env('COGNITO_SIGN_IN_USERNAME'))
    cy.get('.amplify-button').contains('Sign In').click()
    cy.get('.amplify-error-section').contains('Incorrect username or password')
  })
})