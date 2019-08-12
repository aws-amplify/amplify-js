import { newE2EPage } from '@stencil/core/testing';

describe('Checkbox Component:', () => {
  it('should render a amplify-checkbox', async () => {
    const page = await newE2EPage();
    await page.setContent(`<amplify-checkbox></amplify-checkbox>`);
    const el = await page.find('amplify-checkbox');
    expect(el).not.toBeNull();
  });
});