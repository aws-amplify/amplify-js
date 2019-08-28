import { newSpecPage } from '@stencil/core/testing';
import { AmplifyCheckbox } from './amplify-checkbox';

describe('amplify-checkbox spec:', () => {
  describe('Component logic ->', () => {
    let checkbox;

    beforeEach(() => {
      checkbox = new AmplifyCheckbox();
    });

    it('should have checked prop set to false by default', () => {
      expect(checkbox.checked).toBe(false);
    });

    it('should have disabled prop set to false by default', () => {
      expect(checkbox.disabled).toBe(false);
    });

    it('should have style override prop set to false by default', () => {
      expect(checkbox.overrideStyle).toBe(false);
    });
  });
  describe('Render logic ->', () => {
    it('should render a checkbox with an input type of checkbox and empty label by default', async () => {
      const page = await newSpecPage({
        components: [AmplifyCheckbox],
        html: `<amplify-checkbox></amplify-checkbox>`
      });

      expect(page.root).toMatchSnapshot();
    });

    it('should render with only a class of `amplify-ui--checkbox` when style override is true', async () => {
      const page = await newSpecPage({
        components: [AmplifyCheckbox],
        html: `<amplify-checkbox override-style='true'></amplify-checkbox>`
      });

      expect(page.root).toMatchSnapshot();
    });

    it('should render a checkbox with an input type of checkbox and label', async () => {
      const page = await newSpecPage({
        components: [AmplifyCheckbox],
        html: `<amplify-checkbox label="Seattle"></amplify-checkbox>`
      });

      expect(page.root).toMatchSnapshot();
    });
  });
});