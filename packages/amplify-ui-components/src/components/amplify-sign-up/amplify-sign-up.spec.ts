import { newSpecPage } from '@stencil/core/testing';
import { AmplifySignUp } from './amplify-sign-up';

describe('amplify-sign-in spec:', () => {
  describe('Component logic ->', () => {
    let signUp;

    beforeEach(() => {
      signUp = new AmplifySignUp();
    });

    it('should render `handleSubmit` as undefined by default', () => {
      expect(signUp.handleSubmit).toBeUndefined();
    });

    it('should render `validationErrors` as undefined by default', () => {
      expect(signUp.validationErrors).toBeUndefined();
    });

    it('should render `headerText` to `Create a new account` by default', () => {
      expect(signUp.headerText).toEqual('Create a new account');
    });

    it('should render `submitButtonText` to `Create account` by default', () => {
      expect(signUp.submitButtonText).toEqual('Create account');
    });

    it('should render `overrideStyle` to false by default', () => {
      expect(signUp.overrideStyle).toBe(false);
    });
  });
  describe('Render logic ->', () => {
    it('should render a `sign in` form by default', async () => {
      const page = await newSpecPage({
        components: [AmplifySignUp],
        html: `<amplify-sign-up></amplify-sign-up>`,
      });

      expect(page.root).toMatchSnapshot();
    });
  });
});
