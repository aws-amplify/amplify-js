import { newE2EPage } from '@stencil/core/testing';

describe('amplify-field', () => {
  it('renders no label or description if none are provided', async () => {
    const page = await newE2EPage();

    await page.setContent(`<amplify-field></amplify-field>`);

    const labelElement = await page.find('label');
    expect(labelElement).toBeNull();

    const descriptionElement = await page.find('.description');
    expect(descriptionElement).toBeNull();
  });
});