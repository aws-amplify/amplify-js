import { newE2EPage } from '@stencil/core/testing';
import { pixelThreshold } from '../../common/testing';

describe('amplify-code-field e2e:', () => {
	it('should render a amplify-code-field', async () => {
		const page = await newE2EPage();
		await page.setContent(`<amplify-code-field></amplify-code-field>`);
		const el = await page.find('amplify-code-field');
		expect(el).not.toBeNull();

		const screenshot = await page.compareScreenshot('amplify-code-field', {
			fullPage: true,
		});
		expect(screenshot).toMatchScreenshot({
			allowableMismatchedPixels: pixelThreshold,
		});
	});
});
