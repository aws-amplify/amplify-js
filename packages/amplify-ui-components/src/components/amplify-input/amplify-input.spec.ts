import { newSpecPage } from '@stencil/core/testing';
import { AmplifyInput } from './amplify-input';

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
    let input;

    beforeEach(() => {
      input = new AmplifyInput();
    });

    it('should have `name` set to undefined by default', () => {
      expect(input.name).toBeUndefined();
    });

    it('should have `description` set to undefined by default', () => {
      expect(input.description).toBeUndefined();
    });

    it('should have `placeholder` set to an empty string by default', () => {
      expect(input.placeholder).toEqual('');
    });

    it('should have `type` set to `text` by default', () => {
      expect(input.type).toEqual('text');
    });

    it('should have overrideStyle false by default', () => {
      expect(input.overrideStyle).toBe(false);
    });
  });
});
