describe('Angular Authenticator: ', function() {
  beforeEach(function() {
    cy.visit('/');
  });

  describe('SignIn', () => {
    it('renders a sign in header by default', () => {
      cy.get('.amplify-form-header').contains('Sign in to your account')
    });
  
    it('allows the user to sign in', () => {
      cy.get('.amplify-signin-username').within(() => {
        cy.get('input').type(Cypress.env('COGNITO_SIGN_IN_USERNAME'));
      })
  
      cy.get('.amplify-signin-password').within(() => {
        cy.get('input').type(Cypress.env('COGNITO_SIGN_IN_PASSWORD'));
      })
  
      cy.get('button').contains('Sign In').click()
  
      cy.wait(500);
  
      cy.get('.amplify-greeting-text').contains(`Hello, ${Cypress.env('COGNITO_SIGN_IN_USERNAME')}`);
    });

    it('renders a signup link', () => {
      cy.get('.amplify-form-link').contains('Create account');
    });

    it('renders a forgot password link', () => {
      cy.get('.amplify-form-link').contains('Reset your password');
    });

  })

  describe('Sign Out', function() {
    beforeEach(() => {
      cy.get('.amplify-signin-username').within(() => {
        cy.get('input').type(Cypress.env('COGNITO_SIGN_IN_USERNAME'));
      })
  
      cy.get('.amplify-signin-password').within(() => {
        cy.get('input').type(Cypress.env('COGNITO_SIGN_IN_PASSWORD'));
      })
  
      cy.get('button').contains('Sign In').click()
  
      cy.wait(500);
  
    })

    it('renders a greeting component when signed in', () => {
      cy.get('.amplify-greeting-text').contains(`Hello, ${Cypress.env('COGNITO_SIGN_IN_USERNAME')}`);
      cy.get('.amplify-greeting-sign-out').contains('Sign out');
    });

    it('allows the user to sign out', () => {
      cy.get('.amplify-greeting-sign-out').contains('Sign out').click();
      cy.wait(500);
      cy.get('.amplify-form-header').contains('Sign in to your account')
    });
  });

  describe('Sign Up', function() {
    beforeEach(() => {
      cy.get('.amplify-form-link').contains('Create account').click();
    })
    
    it('allows the user to navigate to the sign up component', () => {
      cy.get('.amplify-form-header').contains('Create a new account');
    });

    it('renders a username field by default', () => {
      cy.get('input[placeholder="Username"]');
    });

    it('renders a password field by default', () => {
      cy.get('input[placeholder="Password"]');
    });

    it('renders a email field by default', () => {
      cy.get('input[placeholder="Email"]');
    });

    it('renders a phone number field by default', () => {
      cy.get('input[placeholder="Phone Number"]');
    });

    it('renders a sign in link', () => {
      cy.get('.amplify-form-link').contains('Sign in');
    });

    // TODO: CLI INTEGRATION TO SPIN UP NEW RESOURCES SO WE CAN TEST HAPPY PATH SIGNUP FLOW:
    // it('allows the user to signup', () => {

    //   function generate() {
    //     let text = "";
    //     const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    //     const lower = "abcdefghijklmnopqrstuvwxyz";
    //     const special = "@$&!"

      
    //     for (var i = 0; i < 5; i++) {
    //       text += 
    //         upper.charAt(Math.floor(Math.random() * upper.length)) +
    //         lower.charAt(Math.floor(Math.random() * lower.length)) +
    //         special.charAt(Math.floor(Math.random() * special.length))
    //       ;
    //     }
    //     return text;
    //   }

    //   cy.get('input[placeholder="Username"]').type(new Date().getTime().toString());
    //   cy.get('input[placeholder="Password"]').type(generate());
    //   cy.get('input[placeholder="Email"]').type(Cypress.env('COGNITO_SIGN_IN_EMAIL'));
    //   cy.get('input[placeholder="Email"]').type(Cypress.env('COGNITO_SIGN_IN_PHONE'));
    // });

    it('allows the user to attempt sign up', () => {
      cy.get('input[placeholder="Username"]').type(Cypress.env('COGNITO_SIGN_IN_USERNAME'));
      cy.get('input[placeholder="Password"]').type(Cypress.env('COGNITO_SIGN_IN_PASSWORD'));
      cy.get('input[placeholder="Email"]').type(Cypress.env('COGNITO_SIGN_IN_EMAIL'));
      cy.get('input[placeholder="Phone Number"]').type(Cypress.env('COGNITO_SIGN_IN_PHONE'));

      cy.get('.amplify-form-button').contains('Sign Up').click();

      cy.wait(500);

      cy.get('.amplify-alert-message').contains('User already exists');
    });

  });

})
