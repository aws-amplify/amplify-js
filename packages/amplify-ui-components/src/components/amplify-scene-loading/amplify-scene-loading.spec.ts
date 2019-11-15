import { newSpecPage } from '@stencil/core/testing';
import { AmplifySceneLoading } from './amplify-scene-loading';

describe('amplify-scene spec:', () => {
  describe('Component logic ->', () => {
    let amplifySceneLoading;

    beforeEach(() => {
      amplifySceneLoading = new AmplifySceneLoading();
    });

    it(`'sceneName' should be undefined by default`, () => {
      expect(amplifySceneLoading.sceneName).toBeUndefined();
    });

    it(`'loadPercentage' should be '0' by default`, () => {
      expect(amplifySceneLoading.loadPercentage).toBe(0);
    });

    it(`'sceneError' should be null by default`, () => {
      expect(amplifySceneLoading.sceneError).toBe(null);
    });
  });
  describe('Render logic ->', () => {
    it(`should render`, async () => {
      const page = await newSpecPage({
        components: [AmplifySceneLoading],
        html: `<amplify-scene-loading sceneName={'scene1'} />`,
      });
      expect(page.root).toMatchSnapshot();
    });

    it(`should render with 'loadPercentage'`, async () => {
      const page = await newSpecPage({
        components: [AmplifySceneLoading],
        html: `<amplify-scene-loading sceneName={'scene1'} loadPercentage={50} />`,
      });
      expect(page.root).toMatchSnapshot();
    });

    it(`should render with 'sceneError'`, async () => {
      const sceneError = {
        displayText: 'Could not load scene',
        error: { msg: 'error' },
      };
      const page = await newSpecPage({
        components: [AmplifySceneLoading],
        html: `<amplify-scene-loading sceneName={'scene1'} sceneError={${sceneError}} />`,
      });
      expect(page.root).toMatchSnapshot();
    });
  });
});
