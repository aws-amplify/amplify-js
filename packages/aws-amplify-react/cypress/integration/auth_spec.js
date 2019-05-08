describe('withAuthenticator Sign In', function() {
  beforeEach(function() {
    cy.visit('/');
  });

  it('successfully signs in and out', function() {
    // Check for sign in page header
    cy.get('span').contains('Sign in to your account')

    // Sign in
    cy.get('input[name=username]').type(Cypress.env('COGNITO_SIGN_IN_USERNAME'))
    cy.get('input[name=password]').type(Cypress.env('COGNITO_SIGN_IN_PASSWORD'))
    cy.get('button').contains('Sign In').click()
    
    // Wait 1 second for sign in to load
    cy.wait(1000);

    // Check for signed in page
    cy.get('.App-link').contains('Learn React')
    cy.get('div').contains('Hello ' + Cypress.env('COGNITO_SIGN_IN_USERNAME'))
    
    // Sign out
    cy.get('button').contains('Sign Out').click()

    cy.wait(1000);

    // Check if successfully signed out
    cy.get('span').contains('Sign in to your account')
  })

  it('throws validation errors if username or password is incorrect', function() {
    // Check for empty username error
    cy.get('button').contains('Sign In').click()
    cy.get('span').contains("Username cannot be empty")

    cy.get('input[name=username]').type('InvalidUsername')
    cy.get('button').contains('Sign In').click()
    cy.get('span').contains('User does not exist')

    cy.get('input[name=username]').clear().type(Cypress.env('COGNITO_SIGN_IN_USERNAME'))
    cy.get('input[name=password]').type('InvalidPassword')
    cy.get('button').contains('Sign In').click()
    cy.get('span').contains('Incorrect username or password')
  })
})
