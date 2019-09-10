import { newSpecPage } from '@stencil/core/testing';
import { AmplifyInput } from './amplify-input'

describe('amplify-input spec:', () => {
  describe('Render logic ->', () => {
    it('renders correct HTML', async () => {
      const page = await newSpecPage({
        components: [AmplifyInput],
        html: `<amplify-input></amplify-input>`,
      });

      expect(page.root).toMatchSnapshot();
    });
    it('renders without Emotion CSS class when overrideStyle is true', async () => {
      const page = await newSpecPage({
        components: [AmplifyInput],
        html: `<amplify-input override-style='true'></amplify-input>`,
      });

      expect(page.root).toMatchSnapshot();
    });
  });
  describe('Component logic ->', () => {
    it('should have overrideStyle false by default', async () => {
      const input = new AmplifyInput();
      expect(input.overrideStyle).toBe(false);
    });
  });
});
