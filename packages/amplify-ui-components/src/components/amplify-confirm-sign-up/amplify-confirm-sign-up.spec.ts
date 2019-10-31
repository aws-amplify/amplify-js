import { newSpecPage } from '@stencil/core/testing';
import { AmplifyConfirmSignUp } from './amplify-confirm-sign-up';
import { CONFIRM_SIGN_UP_HEADER_TEXT, CONFIRM_SIGN_UP_SUBMIT_BUTTON_TEXT } from '../../common/constants';

describe('amplify-confirm-sign-up spec:', () => {
  describe('Component logic ->', () => {
    let confirmSignUp;

    beforeEach(() => {
      confirmSignUp = new AmplifyConfirmSignUp();
    });

    it('should render `handleSubmit` as defined by default', () => {
      expect(confirmSignUp.handleSubmit).toBeDefined();
    });

    it('should render `validationErrors` as undefined by default', () => {
      expect(confirmSignUp.validationErrors).toBeUndefined();
    });

    it('should render `headerText` to `Confirm Sign up` by default', () => {
      expect(confirmSignUp.headerText).toEqual(CONFIRM_SIGN_UP_HEADER_TEXT);
    });

    it('should render `submitButtonText` to `Confirm` by default', () => {
      expect(confirmSignUp.submitButtonText).toEqual(CONFIRM_SIGN_UP_SUBMIT_BUTTON_TEXT);
    });

    it('should render `overrideStyle` to false by default', () => {
      expect(confirmSignUp.overrideStyle).toBe(false);
    });
  });
  describe('Render logic ->', () => {
    it('should render a `confirm sign up` form by default', async () => {
      const page = await newSpecPage({
        components: [AmplifyConfirmSignUp],
        html: `<amplify-confirm-sign-up></amplify-confirm-sign-up>`,
      });

      expect(page.root).toMatchSnapshot();
    });
  });
});
