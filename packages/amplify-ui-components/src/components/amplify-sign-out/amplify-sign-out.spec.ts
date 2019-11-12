import { newSpecPage } from '@stencil/core/testing';
import { AmplifySignOut } from './amplify-sign-out';
import { SIGN_OUT } from '../../common/constants';

describe('amplify-sign-out spec:', () => {
  describe('Component logic ->', () => {
    let signOut;

    beforeEach(() => {
      signOut = new AmplifySignOut();
    });

    it('should render default `buttonText`', () => {
      expect(signOut.buttonText).toEqual(SIGN_OUT);
    });

    it('should render `overrideStyle` to false by default', () => {
      expect(signOut.overrideStyle).toBe(false);
    });
  });
  describe('Render logic ->', () => {
    it('should render a `sign out` button by default', async () => {
      const page = await newSpecPage({
        components: [AmplifySignOut],
        html: `<amplify-sign-out></amplify-sign-out>`,
      });

      expect(page.root).toMatchSnapshot();
    });
  });
});
