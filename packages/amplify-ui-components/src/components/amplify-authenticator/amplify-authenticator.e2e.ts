import { newE2EPage } from '@stencil/core/testing';
import { pixelThreshold } from '../../common/testing';

describe('amplify-authenticator e2e:', () => {
  it('should render a amplify-authenticator', async () => {
    const page = await newE2EPage();
    await page.setContent(`<amplify-authenticator></amplify-authenticator>`);
    const el = await page.find('amplify-authenticator');
    expect(el).not.toBeNull();

    const screenshot = await page.compareScreenshot('amplify-authenticator', { fullPage: true });
    expect(screenshot).toMatchScreenshot({ allowableMismatchedPixels: pixelThreshold });
  });
});