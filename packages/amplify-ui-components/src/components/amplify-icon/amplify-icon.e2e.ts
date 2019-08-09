import { newE2EPage } from '@stencil/core/testing';

describe('amplify-icon', () => {
  it('renders with a different test name', async () => {
    const page = await newE2EPage();

    await page.setContent(
      `<amplify-icon name='sound-mute'></amplify-icon>`,
    );
    const screenshot = await page.compareScreenshot('Amplify icon', {fullPage: true});
    expect(screenshot).toMatchScreenshot({ allowableMismatchedPixels: 10 });

    const iconElement = await page.find('amplify-icon');
    expect(iconElement).not.toBeNull();
  });
});