import { newE2EPage } from '@stencil/core/testing';

describe('Radio Button Component:', () => {
  it('should render a amplify-radio-button', async () => {
    const page = await newE2EPage();
    await page.setContent(`<amplify-radio-button></amplify-radio-button>`);
    const el = await page.find('amplify-radio-button');
    expect(el).not.toBeNull();
  });
});