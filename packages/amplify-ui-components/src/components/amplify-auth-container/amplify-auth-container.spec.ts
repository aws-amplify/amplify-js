import { newSpecPage } from '@stencil/core/testing';
import { AmplifyAuthContainer } from './amplify-auth-container';

describe('amplify-auth-container spec:', () => {
  describe('Render logic ->', () => {
    it('should render with an empty slot', async () => {
      const page = await newSpecPage({
        components: [AmplifyAuthContainer],
        html: `<amplify-auth-container></amplify-auth-container>`,
      });
      expect(page.root).toMatchSnapshot();
    });
  });
});
