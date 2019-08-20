import { newE2EPage } from '@stencil/core/testing';
import { pixelThreshold } from '../../common/testing';

describe('amplify-form-section', () => {
  it('should render amplify-form-section with a button text as `Submit`', async () => {
    const page = await newE2EPage();
    await page.setContent(`<amplify-form-section></amplify-form-section>`);

    const el = await page.find('amplify-form-section');
    expect(el).not.toBeNull();

    const screenshot = await page.compareScreenshot('amplify-form-section', { fullPage: true });
    expect(screenshot).toMatchScreenshot({ allowableMismatchedPixels: pixelThreshold });
  });

  it('should change `button label` to `Enter`', async () => {
    const page = await newE2EPage();
    await page.setContent(`<amplify-form-section></amplify-form-section>`);

    const formSectionEl = await page.find('amplify-form-section');
    expect(formSectionEl).not.toBeNull();

    formSectionEl.setProperty('button-label', 'Enter');

    await page.waitForChanges();

    const buttonLabel = await formSectionEl.getProperty('button-label');

    expect(buttonLabel).toEqual('Enter');
  });
});