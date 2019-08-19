import { newSpecPage } from '@stencil/core/testing';
import { AmplifyCheckbox } from './amplify-checkbox';

describe('amplify-checkbox:', () => {
  describe('Default cases ->', () => {
    describe('Class logic ->', () => {
      let checkbox;

      beforeEach(() => {
        checkbox = new AmplifyCheckbox();
      });

      it('should have checked prop set to false', () => {
        expect(checkbox.checked).toBe(false);
      });

      it('should have disabled prop set to false', () => {
        expect(checkbox.disabled).toBe(false);
      });

      it('should have style override prop set to false', () => {
        expect(checkbox.styleOverride).toBe(false);
      });
    });
    describe('HTML logic ->', () => {
      it('should render with only a class of `amplify-ui--checkbox` when style override is true', async () => {
        const page = await newSpecPage({
          components: [AmplifyCheckbox],
          html: `<amplify-checkbox style-override='true'></amplify-checkbox>`
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

      it('should render a checkbox with an input type of checkbox and empty label', async () => {
        const page = await newSpecPage({
          components: [AmplifyCheckbox],
          html: `<amplify-checkbox></amplify-checkbox>`
        });

        expect(page.root).toMatchSnapshot();
      });
    });
  });
});