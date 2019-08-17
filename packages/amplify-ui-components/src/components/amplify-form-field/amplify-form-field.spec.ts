import { newSpecPage } from '@stencil/core/testing';
import { AmplifyFormField } from './amplify-form-field'

describe('amplify-form-field', () => {
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
});
