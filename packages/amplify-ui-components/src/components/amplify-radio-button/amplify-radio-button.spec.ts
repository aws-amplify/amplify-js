import { newSpecPage } from '@stencil/core/testing';
import { AmplifyRadioButton } from './amplify-radio-button';

describe('Radio Button Compoent:', () => {
  describe('Default cases ->', () => {
    describe('Class logic', () => {
      let radio;

      beforeEach(() => {
        radio = new AmplifyRadioButton();
      });

      it('should render false for style override and type of radio for input', () => {
        expect(radio.type).toEqual('radio');
        expect(radio.styleOverride).toBe(false);
      });
    });
    describe('Html logic', () => {
      it('should render only class `amplify-ui-radio-button` when style override is set to true', async () => {
        const page = await newSpecPage({
          components: [AmplifyRadioButton],
          html: `<amplify-radio-button style-override="true"></amplify-radio-button>`
        });

        expect(page.root).toEqualHtml(`<amplify-radio-button style-override="true">
        <span class=\"amplify-ui-radio-button\">
          <input type=\"radio\">
          <amplify-label></amplify-label>
        </span>
      </amplify-radio-button>`);
      });
      it('should render a radio button with no label and a type of radio for input', async () => {
        const page = await newSpecPage({
          components: [AmplifyRadioButton],
          html: `<amplify-radio-button></amplify-radio-button>`
        });

        expect(page.root).toEqualHtml(`<amplify-radio-button>
        <span class=\"amplify-ui-radio-button css-1i87iyc\">
          <input type=\"radio\">
          <amplify-label></amplify-label>
        </span>
      </amplify-radio-button>`);
      });
    });
  });
});