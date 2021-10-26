import { newE2EPage } from '@stencil/core/testing';
import { pixelThreshold } from '../../common/testing';

describe('amplify-email-field e2e:', () => {
	it('should render a amplify-email-field', async () => {
		const page = await newE2EPage();
		await page.setContent(`<amplify-email-field></amplify-email-field>`);
		const el = await page.find('amplify-email-field');
		expect(el).not.toBeNull();

		const screenshot = await page.compareScreenshot('amplify-email-field', {
			fullPage: true,
		});
		expect(screenshot).toMatchScreenshot({
			allowableMismatchedPixels: pixelThreshold,
		});
	});
});
