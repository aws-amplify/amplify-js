import { E2EPage, newE2EPage } from '@stencil/core/testing';
import { pixelThreshold } from '../../common/testing';

describe('amplify-hint e2e:', () => {
	let page: E2EPage;

	beforeEach(async () => {
		page = await newE2EPage();
		await page.setContent('<amplify-hint>This is a hint</amplify-hint>');
	});

	it('renders with text `This is a hint`', async () => {
		const element = await page.find('amplify-hint');
		expect(element).not.toBeNull();

		const screenshot = await page.compareScreenshot('amplify-hint', {
			fullPage: true,
		});
		expect(screenshot).toMatchScreenshot({
			allowableMismatchedPixels: pixelThreshold,
		});
	});
});
