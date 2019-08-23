import { newE2EPage } from '@stencil/core/testing';

describe('amplify-button', () => {
  it('renders', async () => {
    const page = await newE2EPage();

    await page.setContent('<amplify-button></amplify-button>');
    const element = await page.find('amplify-button');
    expect(element).toHaveProperty('type');
  });
});
