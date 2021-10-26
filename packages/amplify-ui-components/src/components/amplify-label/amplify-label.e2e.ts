import { E2EPage, newE2EPage } from '@stencil/core/testing';
import { pixelThreshold } from '../../common/testing';

describe('amplify-label e2e:', () => {
	let page: E2EPage;

	beforeEach(async () => {
		page = await newE2EPage();
		await page.setContent('<amplify-label>This is a label</amplify-label>');
	});

	it('renders with text `This is a label`', async () => {
		const element = await page.find('amplify-label');
		expect(element).not.toBeNull();

		const screenshot = await page.compareScreenshot('amplify-label', {
			fullPage: true,
		});
		expect(screenshot).toMatchScreenshot({
			allowableMismatchedPixels: pixelThreshold,
		});
	});
});
