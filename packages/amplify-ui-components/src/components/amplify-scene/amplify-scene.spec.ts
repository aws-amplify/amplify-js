// import { newSpecPage } from '@stencil/core/testing';
import { AmplifyScene } from './amplify-scene';

describe('amplify-sign-in spec:', () => {
  describe('Component logic ->', () => {
    let amplifyScene;

    beforeEach(() => {
      amplifyScene = new AmplifyScene();
    });

    it('`sceneName` should be undefined by default', () => {
      expect(amplifyScene.sceneName).toBeUndefined();
    });

    it('`loading` should be false by default', () => {
      expect(amplifyScene.loading).toBeFalsy();
    });
  });
  describe('Render logic ->', () => {
    // TODO: Add snapshot testing
    // it('should render', async () => {
    // 	const page = await newSpecPage({
    // 		components: [AmplifyScene],
    // 		html: `<amplify-scene sceneName={'scene1'} />`
    // 	});
    // 	expect(page.root).toMatchSnapshot();
    // });
  });
});
