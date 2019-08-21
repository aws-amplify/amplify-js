import { newSpecPage } from '@stencil/core/testing';
import { AmplifyButton } from './amplify-button';

describe('amplify-input', () => {
  it('renders correct HTML', async () => {
    const page = await newSpecPage({
      components: [AmplifyButton],
      html: `<amplify-button></amplify-button>`,
    });

    expect(page.root).toMatchSnapshot();
  });
});
