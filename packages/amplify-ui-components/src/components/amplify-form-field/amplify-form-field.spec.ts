import { newSpecPage } from '@stencil/core/testing';
import { AmplifyFormField } from './amplify-form-field'

describe('amplify-form-field spec:', () => {
  describe('Component logic ->', () => {
    let formField;

    beforeEach(() => {
      formField = new AmplifyFormField();
    });

    it('should have style override prop set to false by default', () => {
      expect(formField.overrideStyle).toBe(false);
    });
  });
  describe('Render logic ->', () => {
    it('renders no label or description if none are provided', async () => {
      const page = await newSpecPage({
        components: [AmplifyFormField],
        html: `<amplify-form-field></amplify-form-field>`,
      });

      expect(page.root).toMatchSnapshot();
    });

    it('renders a label and description, if they are provided, and no id', async () => {
      const page = await newSpecPage({
        components: [AmplifyFormField],
        html: `<amplify-form-field label='label' description='description'></amplify-form-field>`,
      });

      expect(page.root).toMatchSnapshot();
    });

    it('renders with an id, if it is provided', async () => {
      const page = await newSpecPage({
        components: [AmplifyFormField],
        html: `<amplify-form-field label='label' description='description' field-id='id'></amplify-form-field>`,
      });

      expect(page.root).toMatchSnapshot();
    });

    it('replaces the input component, if a new one is provided', async () => {
      const page = await newSpecPage({
        components: [AmplifyFormField],
        html: `<amplify-form-field label='label' description='description' field-id='id'><input slot="input" /></amplify-form-field>`,
      });

      expect(page.root).toMatchSnapshot();
    });

    it('renders without Emotion CSS classes when style override is true', async () => {
      const page = await newSpecPage({
        components: [AmplifyFormField],
        html: `<amplify-form-field label='label' description='description' field-id='id' override-style='true'></amplify-form-field>`,
      });

      expect(page.root).toMatchSnapshot();
    });
  });
});
