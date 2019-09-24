import { newSpecPage } from '@stencil/core/testing';
import { AmplifyLink } from './amplify-link';

describe('amplify-link spec:', () => {
  describe('Component logic ->', () => {
    let link;

    beforeEach(() => {
      link = new AmplifyLink();
    });

    it('should render false for style override prop by default', () => {
      expect(link.role).toEqual('navigation');
    });
    
    it('should render false for style override prop by default', () => {
      expect(link.overrideStyle).toBe(false);
    });
  });
  describe('Render logic ->', () => {
    it('should render a link by default', async () => {
      const page = await newSpecPage({
        components: [AmplifyLink],
        html: `<amplify-link></amplify-link>`
      });

      expect(page.root).toMatchSnapshot();
    });

    it('should render only class `amplify-ui--link` when override style is set to true', async () => {
      const page = await newSpecPage({
        components: [AmplifyLink],
        html: `<amplify-link override-style="true"></amplify-link>`
      });

      expect(page.root).toMatchSnapshot();
    });
  });
});