import { newSpecPage } from '@stencil/core/testing';
import { AmplifyPhoneField } from './amplify-phone-field';
import { PHONE_SUFFIX, PHONE_LABEL, PHONE_PLACEHOLDER } from '../../common/constants';

describe('amplify-phone-field spec:', () => {
  describe('Component logic ->', () => {
    let phoneField;

    beforeEach(() => {
      phoneField = new AmplifyPhoneField();
    });

    it('should render `phone` for the field id', () => {
      expect(phoneField.fieldId).toEqual(PHONE_SUFFIX);
    });

    it('should have `label` render to `Verification phone` by default', () => {
      expect(phoneField.label).toEqual(PHONE_LABEL);
    });

    it('should have `placeholder` render to `Enter phone` by default', () => {
      expect(phoneField.placeholder).toEqual(PHONE_PLACEHOLDER);
    });

    it('should have `required` set to `false` by default', () => {
      expect(phoneField.required).toBe(false);
    });
  });
  describe('Render logic ->', () => {
    it('should render `placeholder` and `label values', async () => {
      const page = await newSpecPage({
        components: [AmplifyPhoneField],
        html: `<amplify-phone-field label="New phone *" placeholder="Enter new phone"></amplify-phone-field>`,
      });

      expect(page.root).toMatchSnapshot();
    });

    it('should render default values by default', async () => {
      const page = await newSpecPage({
        components: [AmplifyPhoneField],
        html: `<amplify-phone-field></amplify-phone-field>`,
      });

      expect(page.root).toMatchSnapshot();
    });
  });
});
