describe('Angular Authenticator: ', function() {
  beforeEach(function() {
    cy.visit('/');
  });

  describe('SignIn', () => {
    it('renders a sign in header by default', () => {
      cy.contains('.amplify-form-header', 'Sign in to your account');
    });
  
    it('allows the user to sign in', () => {
      cy.get('.amplify-signin-username input').type(Cypress.env('COGNITO_SIGN_IN_USERNAME'));
      cy.get('.amplify-signin-password input').type(Cypress.env('COGNITO_SIGN_IN_PASSWORD'));
      cy.contains('button', 'Sign In').click()
      cy.contains('.amplify-greeting-text', `Hello, ${Cypress.env('COGNITO_SIGN_IN_USERNAME')}`);
    });

    it('renders a signup link', () => {
      cy.contains('.amplify-form-link', 'Create account');
    });

    it('renders a forgot password link', () => {
      cy.contains('.amplify-form-link', 'Reset your password');
    });

  })

  describe('Sign Out', function() {
    beforeEach(() => {
      cy.get('.amplify-signin-username input').type(Cypress.env('COGNITO_SIGN_IN_USERNAME'));
  
      cy.get('.amplify-signin-password input').type(Cypress.env('COGNITO_SIGN_IN_PASSWORD'));
  
      cy.contains('button', 'Sign In').click()
    })

    it('renders a greeting component when signed in', () => {
      cy.contains('.amplify-greeting-text', `Hello, ${Cypress.env('COGNITO_SIGN_IN_USERNAME')}`);
      cy.contains('.amplify-greeting-sign-out', 'Sign out');
    });

    it('allows the user to sign out', () => {
      cy.contains('.amplify-greeting-sign-out', 'Sign out').click();
      cy.contains('.amplify-form-header', 'Sign in to your account')
    });
  });

  describe('Sign Up', function() {
    beforeEach(() => {
      cy.contains('.amplify-form-link', 'Create account').click();
    })
    
    it('allows the user to navigate to the sign up component', () => {
      cy.contains('.amplify-form-header', 'Create a new account');
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
      cy.contains('.amplify-form-link', 'Sign in');
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

    it('allows the user to attempt sign up (user already exists)', () => {
      cy.get('input[placeholder="Username"]').type(Cypress.env('COGNITO_SIGN_IN_USERNAME'));
      cy.get('input[placeholder="Password"]').type(Cypress.env('COGNITO_SIGN_IN_PASSWORD'));
      cy.get('input[placeholder="Email"]').type(Cypress.env('COGNITO_SIGN_IN_EMAIL'));
      cy.get('input[placeholder="Phone Number"]').type(Cypress.env('COGNITO_SIGN_IN_PHONE'));

      cy.contains('.amplify-form-button', 'Sign Up').click();

      cy.get('.amplify-alert-message');
    });
  });

  describe('Forgot Password', function() {
    beforeEach(() => {
      cy.contains('.amplify-form-link', 'Reset your password').click();
    });

    it('allows the user to navigate to the forgot password component', () => {
      cy.contains('.amplify-form-header', 'Reset your password');
    });

    it('renders a username field', () => {
      cy.get('input[placeholder="Username"]');
    });

    it('renders a Back to Sign In link', () => {
      cy.contains('.amplify-form-link', 'Back to Sign in');
    });

    it('allows the user to navigate back to sign in', () => {
      cy.contains('.amplify-form-link', 'Back to Sign in').click();
      cy.contains('.amplify-form-header', 'Sign in to your account');
    });

    // To test further, need a way of handling attempt limit exceptions
  });

})
