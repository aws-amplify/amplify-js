import { newSpecPage } from '@stencil/core/testing';
import { AmplifyToast } from './amplify-toast';

describe('amplify-toast spec:', () => {
  describe('Component logic ->', () => {
    let toast;

    beforeEach(() => {
      toast = new AmplifyToast();
    });

    it('should have `onClose` be undefined by default', () => {
      expect(toast.onClose).toBeUndefined();
    });
  });
  describe('Render logic ->', () => {
    it('should render `Toast!`', async () => {
      const page = await newSpecPage({
        components: [AmplifyToast],
        html: `<amplify-toast></amplify-toast>`,
      });

      expect(page.root).toMatchSnapshot();
    });
  });
});
