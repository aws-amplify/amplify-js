import { newSpecPage } from '@stencil/core/testing';
import { AmplifyIcon } from './amplify-icon'

describe('amplify-icon', () => {
  it('renders correct HTML', async () => {
    const page = await newSpecPage({
      components: [AmplifyIcon],
      html: `<amplify-icon name='sound-mute'></amplify-icon>`,
    });

    expect(page.root).toMatchSnapshot();
  });
});