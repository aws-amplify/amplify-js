import { newSpecPage } from '@stencil/core/testing';
import { AmplifyButton } from './amplify-button';

describe('amplify-input spec:', () => {
  describe('Render logic ->', () => {
    it('renders with no button text', async () => {
      const page = await newSpecPage({
        components: [AmplifyButton],
        html: `<amplify-button></amplify-button>`,
      });

      expect(page.root).toMatchSnapshot();
    });
    it('renders with button text FOO', async () => {
      const page = await newSpecPage({
        components: [AmplifyButton],
        html: `<amplify-button>FOO</amplify-button>`,
      });

      expect(page.root).toMatchSnapshot();
    });
  });
});
