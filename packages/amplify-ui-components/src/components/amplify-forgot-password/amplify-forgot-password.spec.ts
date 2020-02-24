import { newSpecPage } from '@stencil/core/testing';
import { AmplifyForgotPassword } from './amplify-forgot-password';
import { RESET_YOUR_PASSWORD, SEND_CODE } from '../../common/constants';

describe('amplify-forgot-password spec:', () => {
  describe('Component logic ->', () => {
    let amplifyForgotPassword;

    beforeEach(() => {
      amplifyForgotPassword = new AmplifyForgotPassword();
    });

    it('`headerText` should be set by default', () => {
      expect(amplifyForgotPassword.headerText).toBe(RESET_YOUR_PASSWORD);
    });

    it('`submitButtonText` should be set by default', () => {
      expect(amplifyForgotPassword.submitButtonText).toBe(SEND_CODE);
    });
  });
  describe('Render logic ->', () => {
    it(`should render`, async () => {
      const page = await newSpecPage({
        components: [AmplifyForgotPassword],
        html: `<amplify-forgot-password />`,
      });
      expect(page.root).toMatchSnapshot();
    });
  });
});
