import { newSpecPage } from '@stencil/core/testing';
import { AmplifyAuthenticator } from './amplify-authenticator';

describe('amplify-authenticator spec:', () => {
  describe('Component logic ->', () => {
    let authenticator;

    beforeEach(() => {
      authenticator = new AmplifyAuthenticator();
    });

    it('should render `firstInitialLoad` to true by default', () => {
      expect(authenticator.firstInitialLoad).toBe(true);
    });

    it('should render `authState` as `loading` by default', () => {
      expect(authenticator.authState).toEqual('loading');
    });

    it('should render `state` as `loading` by default', () => {
      expect(authenticator.state).toEqual('loading');
    });
  });
  describe('Render logic ->', () => {
    // Need to Address: https://stenciljs.com/docs/templating-jsx#avoid-shared-jsx-nodes
    // it('should render a `sign up` by passing `signup` into state prop', async () => {
    //   const page = await newSpecPage({
    //     components: [AmplifyAuthenticator],
    //     html: `<amplify-authenticator state="signup"></amplify-authenticator>`
    //   });

    //   expect(page.root).toMatchSnapshot();
    // });
    // it('should render a `forgot password` by passing `forgotpassword` into state prop', async () => {
    //   const page = await newSpecPage({
    //     components: [AmplifyAuthenticator],
    //     html: `<amplify-authenticator state="forgotpassword"></amplify-authenticator>`
    //   });

      // expect(page.root).toMatchSnapshot();
    // });

    it('should render a `sign in` by default', async () => {
      const page = await newSpecPage({
        components: [AmplifyAuthenticator],
        html: `<amplify-authenticator></amplify-authenticator>`
      });

      expect(page.root).toMatchSnapshot();
    });
  });
});