import { newE2EPage } from '@stencil/core/testing';
import { pixelThreshold } from '../../common/testing';

describe('amplify-phone-field e2e:', () => {
	it('should render a amplify-phone-field', async () => {
		const page = await newE2EPage();
		await page.setContent(`<amplify-phone-field></amplify-phone-field>`);
		const el = await page.find('amplify-phone-field');
		expect(el).not.toBeNull();

		const screenshot = await page.compareScreenshot('amplify-phone-field', {
			fullPage: true,
		});
		expect(screenshot).toMatchScreenshot({
			allowableMismatchedPixels: pixelThreshold,
		});
	});
});
