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

    it('should render `MFATypes` to undefined by default', () => {
      expect(totp.MFATypes).toBeUndefined();
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
