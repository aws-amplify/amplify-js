import { I18n } from '@aws-amplify/core';
import { newSpecPage } from '@stencil/core/testing';
import { AmplifyForgotPassword } from './amplify-forgot-password';
import { Translations } from '../../common/Translations';

describe('amplify-forgot-password spec:', () => {
  describe('Component logic ->', () => {
    let amplifyForgotPassword;

    beforeEach(() => {
      amplifyForgotPassword = new AmplifyForgotPassword();
    });

    it('`headerText` should be set by default', () => {
      expect(amplifyForgotPassword.headerText).toBe(I18n.get(Translations.RESET_YOUR_PASSWORD));
    });

    it('`submitButtonText` should be set by default', () => {
      expect(amplifyForgotPassword.submitButtonText).toBe(I18n.get(Translations.SEND_CODE));
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
