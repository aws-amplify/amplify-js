import { newSpecPage } from '@stencil/core/testing';
import { AmplifyFormSection } from './amplify-form-section';

describe('amplify-form-section spec:', () => {
  describe('Component logic ->', () => {
    let formSection;

    beforeEach(() => {
      formSection = new AmplifyFormSection();
    });

    it('should render `Submit` for the button text', () => {
      expect(formSection.submitButtonText).toEqual('Submit');
    });

    it('should have style override prop set to false by default', () => {
      expect(formSection.overrideStyle).toBe(false);
    });
  });
  describe('Render logic ->', () => {
    it('should render a form section with a submit button text of `Go`', async () => {
      const page = await newSpecPage({
        components: [AmplifyFormSection],
        html: `<amplify-form-section submit-button-text="Go"></amplify-form-section>`
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

    it('should render without Emotion CSS classes when style override is true', async () => {
      const page = await newSpecPage({
        components: [AmplifyFormSection],
        html: `<amplify-form-section override-style='true'></amplify-form-section>`
      });

      expect(page.root).toMatchSnapshot();
    });
  });
});