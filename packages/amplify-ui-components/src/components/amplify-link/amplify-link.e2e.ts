import { E2EPage, newE2EPage } from '@stencil/core/testing';
import { pixelThreshold } from '../../common/testing';

describe('amplify-link e2e:', () => {
	let page: E2EPage;

	beforeEach(async () => {
		page = await newE2EPage();
		await page.setContent('<amplify-link>This is a link</amplify-link>');
	});

	it('renders with text `This is a link`', async () => {
		const element = await page.find('amplify-link');
		expect(element).not.toBeNull();

		const screenshot = await page.compareScreenshot('amplify-link', {
			fullPage: true,
		});
		expect(screenshot).toMatchScreenshot({
			allowableMismatchedPixels: pixelThreshold,
		});
	});
});
