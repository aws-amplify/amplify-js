import { newSpecPage } from '@stencil/core/testing';
import { AmplifyScene } from './amplify-scene';
import { XR } from 'aws-amplify';

describe('amplify-scene spec:', () => {
  describe('Component logic ->', () => {
    let amplifyScene;

    beforeEach(() => {
      amplifyScene = new AmplifyScene();
      amplifyScene.loadAndSetupScene = jest.fn();
    });

    it('`sceneName` should be undefined by default', () => {
      expect(amplifyScene.sceneName).toBeUndefined();
    });

    it('`loading` should be false by default', () => {
      expect(amplifyScene.loading).toBeFalsy();
    });
  });
  describe('Render logic ->', () => {
    beforeEach(() => {
      XR.loadScene = jest.fn();
      XR.isSceneLoaded = jest.fn(() => false);
      XR.isMuted = jest.fn(() => false);
      XR.isVRPresentationActive = jest.fn();
      XR.isVRCapable = jest.fn();
      XR.getSceneController = jest.fn();
    });
    it(`should render loading overlay by default`, async () => {
      const page = await newSpecPage({
        components: [AmplifyScene],
        html: `<amplify-scene sceneName={'scene1'} />`,
      });
      expect(page.root).toMatchSnapshot();
    });
    it(`should render scene action bar when 'isSceneLoaded' is true`, async () => {
      XR.isSceneLoaded = jest.fn(() => true);
      const page = await newSpecPage({
        components: [AmplifyScene],
        html: `<amplify-scene sceneName={'scene1'} />`,
      });
      expect(page.root).toMatchSnapshot();
    });
  });
});
