import { E2EPage, newE2EPage } from '@stencil/core/testing';
import { pixelThreshold } from '../../common/testing';

describe('amplify-tooltip e2e:', () => {
  let page: E2EPage;

  beforeEach(async () => {
    page = await newE2EPage();
  });

  it('renders a tooltip correctly', async () => {
    await page.setContent('<div style="margin-bottom:60px"></div> <amplify-tooltip text="Tooltip">FOO</amplify-tooltip>');
    const tooltip = await page.find('amplify-tooltip');
    expect(tooltip).not.toBeNull();

    const screenshot = await page.compareScreenshot('amplify-tooltip', { fullPage: true });
    expect(screenshot).toMatchScreenshot({ allowableMismatchedPixels: pixelThreshold });
  });

  it(`renders an always-visible tooltip if 'shouldAutoShow' is true`, async () => {
    await page.setContent('<amplify-tooltip text="Tooltip" should-auto-show="true">FOO</amplify-tooltip>');

    const tooltip = await page.find('amplify-tooltip');
    console.log((await tooltip.getComputedStyle(":after")).opacity);
    expect(await tooltip.isVisible()).toBe(true);

    // and then hover and do it again
  });

  it(`renders a tooltip that is only visible on hover if 'shouldAutoShow' is false`, async () => {
    await page.setContent('<amplify-tooltip text="Tooltip" should-auto-show="false">FOO</amplify-tooltip>');

    const tooltip = await page.find('amplify-tooltip');

    await page.mouse.move(500, 500);
    console.log(tooltip.classList);

    console.log((await tooltip.getComputedStyle(":after")).opacity);
    // expect(await tooltip.isVisible()).toBe(false);
  });
});