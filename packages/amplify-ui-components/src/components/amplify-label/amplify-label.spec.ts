import { newSpecPage } from '@stencil/core/testing';
import { AmplifyLabel } from './amplify-label';

describe('amplify-label spec:', () => {
  describe('Component logic ->', () => {
    let label;

    beforeEach(() => {
      label = new AmplifyLabel();
    });

    it('should render false for style override prop by default', () => {
      expect(label.overrideStyle).toBe(false);
    });
  });
  describe('Render logic ->', () => {
    it('should render a label by default', async () => {
      const page = await newSpecPage({
        components: [AmplifyLabel],
        html: `<amplify-label></amplify-label>`
      });

      expect(page.root).toMatchSnapshot();
    });

    it('should render only class `amplify-ui--label` when override style is set to true', async () => {
      const page = await newSpecPage({
        components: [AmplifyLabel],
        html: `<amplify-label override-style="true"></amplify-label>`
      });

      expect(page.root).toMatchSnapshot();
    });
  });
});