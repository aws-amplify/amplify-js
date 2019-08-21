import { newSpecPage } from '@stencil/core/testing';
import { AmplifyFormSection } from './amplify-form-section';

describe('amplify-form-section spec:', () => {
  describe('Class logic ->', () => {
    let formSection;

    beforeEach(() => {
      formSection = new AmplifyFormSection();
    });

    it('should render `Submit` for the button label', () => {
      expect(formSection.buttonLabel).toEqual('Submit');
    });
  });
  describe('HTML logic ->', () => {
    it('should render a form section with only a class of `amplify-ui--form-section` when style override is true', async () => {
      const page = await newSpecPage({
        components: [AmplifyFormSection],
        html: `<amplify-form-section override-style="true"></amplify-form-section>`
      });

      expect(page.root).toMatchSnapshot();
    });

    it('should render a form section with a button label of `Go`', async () => {
      const page = await newSpecPage({
        components: [AmplifyFormSection],
        html: `<amplify-form-section button-label="Go"></amplify-form-section>`
      });

      expect(page.root).toMatchSnapshot();
    });

    it('should render a form section with a default button of `Submit`', async () => {
      const page = await newSpecPage({
        components: [AmplifyFormSection],
        html: `<amplify-form-section></amplify-form-section>`
      });

      expect(page.root).toMatchSnapshot();
    });
  });
});