import { E2EPage, newE2EPage } from '@stencil/core/testing';
import { pixelThreshold } from '../../common/testing';

describe('amplify-scene-loading e2e:', () => {
  let page: E2EPage;

  beforeEach(async () => {
    page = await newE2EPage();
    await page.setContent(`<amplify-scene-loading sceneName={'scene1'} />`);
  });

  it(`renders`, async () => {
    const element = await page.find('amplify-scene-loading');
    expect(element).not.toBeNull();

    const screenshot = await page.compareScreenshot('amplify-scene-loading', { fullPage: true });
    expect(screenshot).toMatchScreenshot({ allowableMismatchedPixels: pixelThreshold });
  });
});
