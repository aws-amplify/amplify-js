import { newSpecPage } from '@stencil/core/testing';
import { AmplifyCheckbox } from './amplify-checkbox';

describe('Checkbox Component:', () => {
  describe('Default cases ->', () => {
    describe('Class logic ->', () => {
      let checkbox;

      beforeEach(() => {
        checkbox = new AmplifyCheckbox();
      });

      it('should have style override set to false and type of checkbox for input', () => {
        expect(checkbox.styleOverride).toBe(false);
        expect(checkbox.type).toEqual('checkbox');
      });
    });
    describe('Html logic ->', () => {
      it('should render with only a class of `amplify-checkbox` when style override is true', async () => {
        const page = await newSpecPage({
          components: [AmplifyCheckbox],
          html: `<amplify-checkbox style-override='true'></amplify-checkbox>`
        });

        expect(page.root).toEqualHtml(`<amplify-checkbox style-override="true">
        <span class=\"amplify-ui-checkbox\">
          <input type=\"checkbox\">
          <amplify-label></amplify-label>
        </span>
      </amplify-checkbox>`);
      });

      it('should render a checkbox with an input type of checkbox and empty label', async () => {
        const page = await newSpecPage({
          components: [AmplifyCheckbox],
          html: `<amplify-checkbox></amplify-checkbox>`
        });

        expect(page.root).toEqualHtml(`<amplify-checkbox>
        <span class=\"amplify-ui-checkbox css-1i87iyc\">
          <input type=\"checkbox\">
          <amplify-label></amplify-label>
        </span>
      </amplify-checkbox>`);
      });
    });
  });
});