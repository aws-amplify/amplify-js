import { newE2EPage } from '@stencil/core/testing';
import { pixelThreshold } from '../../common/testing';

describe('amplify-select e2e:', () => {
	it('should render a amplify-select', async () => {
		const page = await newE2EPage();
		await page.setContent(`<amplify-select></amplify-select>`);
		const el = await page.find('amplify-select');
		expect(el).not.toBeNull();

		const screenshot = await page.compareScreenshot('amplify-select', {
			fullPage: true,
		});
		expect(screenshot).toMatchScreenshot({
			allowableMismatchedPixels: pixelThreshold,
		});
	});
});
