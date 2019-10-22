import { newSpecPage } from '@stencil/core/testing';
import { AmplifyForgotPassword } from './amplify-forgot-password';

describe('amplify-forgot-password spec:', () => {
  describe('Component logic ->', () => {
    let amplifyForgotPassword;

    beforeEach(() => {
      amplifyForgotPassword = new AmplifyForgotPassword();
    });

    it('`sceneName` should be undefined by default', () => {
      expect(amplifyForgotPassword.sceneName).toBeUndefined();
    });

    it('`loading` should be false by default', () => {
      expect(amplifyForgotPassword.loading).toBeFalsy();
    });
  });
  describe('Render logic ->', () => {
    beforeEach(() => {
      // XR.loadScene = jest.fn();
      // XR.isSceneLoaded = jest.fn(() => false);
      // XR.isMuted = jest.fn(() => false);
      // XR.isVRPresentationActive = jest.fn();
      // XR.isVRCapable = jest.fn();
      // XR.getSceneController = jest.fn();
    });
    it(`should render loading overlay by default`, async () => {
      const page = await newSpecPage({
        components: [AmplifyForgotPassword],
        html: `<amplify-forgot-password sceneName={'scene1'} />`,
      });
      expect(page.root).toMatchSnapshot();
    });
  });
});
