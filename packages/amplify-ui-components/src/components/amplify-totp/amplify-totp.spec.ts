import { newSpecPage } from '@stencil/core/testing';
import { AmplifyTOTP } from './amplify-totp';
import { SIGN_OUT } from '../../common/constants';

describe('amplify-totp spec:', () => {
  describe('Component logic ->', () => {
    let totp;

    beforeEach(() => {
      totp = new AmplifyTOTP();
    });

    it('should render default `buttonText`', () => {
      expect(totp.buttonText).toEqual(SIGN_OUT);
    });

    it('should render `overrideStyle` to false by default', () => {
      expect(totp.overrideStyle).toBe(false);
    });
  });
  describe('Render logic ->', () => {
    it('should render a `sign out` button by default', async () => {
      const page = await newSpecPage({
        components: [AmplifyTOTP],
        html: `<amplify-totp></amplify-totp>`,
      });

      expect(page.root).toMatchSnapshot();
    });
  });
});
