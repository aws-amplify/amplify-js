import { newSpecPage } from '@stencil/core/testing';
import { AmplifyConfirmSignIn } from './amplify-confirm-sign-in';
import { CONFIRM, CONFIRM_SMS_CODE } from '../../common/constants';

describe('amplify-confirm-sign-in spec:', () => {
  describe('Component logic ->', () => {
    let confirmSignIn;

    beforeEach(() => {
      confirmSignIn = new AmplifyConfirmSignIn();
    });

    it('should render `handleSubmit` as defined by default', () => {
      expect(confirmSignIn.handleSubmit).toBeDefined();
    });

    it('should render `validationErrors` as undefined by default', () => {
      expect(confirmSignIn.validationErrors).toBeUndefined();
    });

    it('should render `headerText` to `Confirm SMS Code` by default', () => {
      expect(confirmSignIn.headerText).toEqual(CONFIRM_SMS_CODE);
    });

    it('should render `submitButtonText` to `Confirm` by default', () => {
      expect(confirmSignIn.submitButtonText).toEqual(CONFIRM);
    });
  });
  describe('Render logic ->', () => {
    it('should render a `confirm sign in` form by default', async () => {
      const page = await newSpecPage({
        components: [AmplifyConfirmSignIn],
        html: `<amplify-confirm-sign-in></amplify-confirm-sign-in>`,
      });

      expect(page.root).toMatchSnapshot();
    });
  });
});
