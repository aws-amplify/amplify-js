import { newSpecPage } from '@stencil/core/testing';
import { AmplifyIconButton } from './amplify-icon-button';

describe('amplify-icon-button spec:', () => {
  describe('Render logic ->', () => {
    it('renders with no button text', async () => {
      const page = await newSpecPage({
        components: [AmplifyIconButton],
        html: `<amplify-icon-button></amplify-icon-button>`,
      });

      expect(page.root).toMatchSnapshot();
    });
    it('renders with button text FOO', async () => {
      const page = await newSpecPage({
        components: [AmplifyIconButton],
        html: `<amplify-icon-button>FOO</amplify-icon-button>`,
      });

      expect(page.root).toMatchSnapshot();
    });
    it('renders without Emotion CSS class when overrideStyle is true', async () => {
      const page = await newSpecPage({
        components: [AmplifyIconButton],
        html: `<amplify-icon-button override-style='true'>FOO</amplify-icon-button>`,
      });

      expect(page.root).toMatchSnapshot();
    });
    it('renders with danger class when button type is reset', async () => {
      const page = await newSpecPage({
        components: [AmplifyIconButton],
        html: `<amplify-icon-button type='reset'>FOO</amplify-icon-button>`,
      });

      expect(page.root).toMatchSnapshot();
    });
  });
  describe('Component logic ->', () => {
    it('should have overrideStyle false by default', async () => {
      const button = new AmplifyIconButton();
      expect(button.overrideStyle).toBe(false);
    });
  });
});
