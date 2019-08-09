import { newE2EPage } from '@stencil/core/testing';

describe('Select Component:', () => {
  it('should render a amplify-select', async () => {
    const page = await newE2EPage();
    await page.setContent(`<amplify-select></amplify-select>`);
    const el = await page.find('amplify-select');
    expect(el).not.toBeNull();
  });
});