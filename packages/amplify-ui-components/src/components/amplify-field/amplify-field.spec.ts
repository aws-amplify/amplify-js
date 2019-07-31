import { newSpecPage } from '@stencil/core/testing';
import { AmplifyField } from './amplify-field.tsx'

describe('amplify-field', () => {
  it('renders no label or description if none are provided', async () => {
    const page = await newSpecPage({
      components: [AmplifyField],
      html: `<amplify-field></amplify-field>`,
    });

    expect(page.root).toMatchSnapshot();
  });

  it('renders a label and description, if they are provided, and no id', async () => {
    const page = await newSpecPage({
      components: [AmplifyField],
      html: `<amplify-field label='label' description='description'></amplify-field>`,
    });

    expect(page.root).toMatchSnapshot();
  });

  it('renders with an id, if it is provided', async () => {
    const page = await newSpecPage({
      components: [AmplifyField],
      html: `<amplify-field label='label' description='description' field-id='id'></amplify-field>`,
    });

    expect(page.root).toMatchSnapshot();
  });
});
