import { E2EPage, newE2EPage } from '@stencil/core/testing';
import { pixelThreshold } from '../../common/testing';

describe('amplify-icon-button e2e:', () => {
  let page: E2EPage;

  beforeEach(async () => {
    page = await newE2EPage();
    await page.setContent('<amplify-icon-button>FOO</amplify-icon-button>');
  });

  it(`renders with text 'FOO'`, async () => {
    const element = await page.find('amplify-icon-button');
    expect(element).not.toBeNull();

    const screenshot = await page.compareScreenshot('amplify-icon-button', { fullPage: true });
    expect(screenshot).toMatchScreenshot({ allowableMismatchedPixels: pixelThreshold });
  });
});
