import { newSpecPage } from '@stencil/core/testing';
import { AmplifySignIn } from './amplify-sign-in';
import { AmplifyForgotPasswordHint } from './amplify-forgot-password-hint';

describe('amplify-sign-in spec:', () => {
  describe('Component logic ->', () => {
    let signIn;

    beforeEach(() => {
      signIn = new AmplifySignIn();
    });

    it('should render `SIGN IN COMPONENTS` on form fields by default', () => {

      const result = [
        {
          type: 'username',
          required: true,
        },
        {
          type: 'password',
          hint: {
            "$attrs$": {
              "forgotPasswordText": "Forgot your password?",
              "resetPasswordText": "Reset password",
            },
            "$children$": null,
            "$elm$": undefined,
            "$flags$": 0,
            "$tag$": AmplifyForgotPasswordHint,
          },
          required: true,
        }
      ];

      expect(signIn.formFields).toEqual(result);
    });

    it('should render `handleSubmit` as undefined by default', () => {
      expect(signIn.handleSubmit).toBeUndefined();
    });

    it('should render `validationErrors` as undefined by default', () => {
      expect(signIn.validationErrors).toBeUndefined();
    });

    it('should render `headerText` to `Sign into your account` by default', () => {
      expect(signIn.headerText).toEqual('Sign into your account');
    });

    it('should render `submitButtonText` to `Sign in` by default', () => {
      expect(signIn.submitButtonText).toEqual('Sign in');
    });

    it('should render `overrideStyle` to false by default', () => {
      expect(signIn.overrideStyle).toBe(false);
    });
  });
  describe('Render logic ->', () => {
    it('should render a `sign in` form by default', async () => {
      const page = await newSpecPage({
        components: [AmplifySignIn],
        html: `<amplify-sign-in></amplify-sign-in>`
      });

      expect(page.root).toMatchSnapshot();
    });
  });
});