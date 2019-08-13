import { newSpecPage } from '@stencil/core/testing';
import { AmplifyRadioButton } from './amplify-radio-button';

describe('amplify-radio-button:', () => {
  describe('Default cases ->', () => {
    describe('Class logic', () => {
      let radio;

      beforeEach(() => {
        radio = new AmplifyRadioButton();
      });

      it('should render false for checked prop', () => {
        expect(radio.checked).toBe(false);
      });

      it('should render false for disabled prop', () => {
        expect(radio.disabled).toBe(false);
      });

      it('should render false for style override prop', () => {
        expect(radio.styleOverride).toBe(false);
      });
    });
    describe('HTML logic', () => {
      it('should render only class `amplify-ui--radio-button` when style override is set to true', async () => {
        const page = await newSpecPage({
          components: [AmplifyRadioButton],
          html: `<amplify-radio-button style-override="true"></amplify-radio-button>`
        });

        expect(page.root).toMatchSnapshot();
      });
      it('should render a radio button with no label and a type of radio for input', async () => {
        const page = await newSpecPage({
          components: [AmplifyRadioButton],
          html: `<amplify-radio-button></amplify-radio-button>`
        });

        expect(page.root).toMatchSnapshot();
      });
    });
  });
});