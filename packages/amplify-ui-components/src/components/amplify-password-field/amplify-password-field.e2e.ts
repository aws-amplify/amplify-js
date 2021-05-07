import { newE2EPage } from '@stencil/core/testing';
import { pixelThreshold } from '../../common/testing';

describe('amplify-password-field e2e:', () => {
	it('should render a amplify-password-field', async () => {
		const page = await newE2EPage();
		await page.setContent(`<amplify-password-field></amplify-password-field>`);
		const el = await page.find('amplify-password-field');
		expect(el).not.toBeNull();

		const screenshot = await page.compareScreenshot('amplify-password-field', {
			fullPage: true,
		});
		expect(screenshot).toMatchScreenshot({
			allowableMismatchedPixels: pixelThreshold,
		});
	});
});
