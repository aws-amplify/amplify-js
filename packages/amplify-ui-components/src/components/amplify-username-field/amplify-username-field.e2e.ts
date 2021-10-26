import { newE2EPage } from '@stencil/core/testing';
import { pixelThreshold } from '../../common/testing';

describe('amplify-username-field e2e:', () => {
	it('should render a amplify-username-field', async () => {
		const page = await newE2EPage();
		await page.setContent(`<amplify-username-field></amplify-username-field>`);
		const el = await page.find('amplify-username-field');
		expect(el).not.toBeNull();

		const screenshot = await page.compareScreenshot('amplify-username-field', {
			fullPage: true,
		});
		expect(screenshot).toMatchScreenshot({
			allowableMismatchedPixels: pixelThreshold,
		});
	});
});
