import { newSpecPage } from '@stencil/core/testing';
import { AmplifyTOTP } from './amplify-totp';

describe('amplify-totp spec:', () => {
  describe('Component logic ->', () => {
    let totp;

    beforeEach(() => {
      totp = new AmplifyTOTP();
    });

    it('should render authData to null by default', () => {
      expect(totp.authData).toEqual(null);
    });

    it('should have `onTOTPEvent` be undefined', () => {
      expect(totp.onTOTPEvent).toBeUndefined();
    });

    it('should have `inputProps` have `autoFocus` set to true by default', () => {
      expect(totp.inputProps.autoFocus).toBe(true);
    });

    it('should have `code` be null by default', () => {
      expect(totp.code).toBeNull();
    });

    it('should have `setUpMessage` be null by default', () => {
      expect(totp.setupMessage).toBeNull();
    });

    it('should have `qrCodeImageSource` be undefined by default', () => {
      expect(totp.qrCodeImageSource).toBeUndefined();
    });

    it('should have `qrCodeInput` be undefined by default', () => {
      expect(totp.qrCodeInput).toBeUndefined();
    });
  });
  describe('Render logic ->', () => {
    it('should render a `less than 2 mfa types available` message by default', async () => {
      const page = await newSpecPage({
        components: [AmplifyTOTP],
        html: `<amplify-totp></amplify-totp>`,
      });

      expect(page.root).toMatchSnapshot();
    });
  });
});
