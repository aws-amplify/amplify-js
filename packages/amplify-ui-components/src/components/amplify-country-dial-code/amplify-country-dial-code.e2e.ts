import { newE2EPage } from '@stencil/core/testing';
import { pixelThreshold } from '../../common/testing';

describe('amplify-country-dial-code e2e:', () => {
	it('should render a amplify-country-dial-code', async () => {
		const page = await newE2EPage();
		await page.setContent(
			`<amplify-country-dial-code></amplify-country-dial-code>`
		);
		const el = await page.find('amplify-country-dial-code');
		expect(el).not.toBeNull();

		const screenshot = await page.compareScreenshot(
			'amplify-country-dial-code',
			{ fullPage: true }
		);
		expect(screenshot).toMatchScreenshot({
			allowableMismatchedPixels: pixelThreshold,
		});
	});
});
