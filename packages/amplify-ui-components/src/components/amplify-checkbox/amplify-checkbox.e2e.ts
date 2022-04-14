import { newE2EPage } from '@stencil/core/testing';
import { pixelThreshold } from '../../common/testing';

describe('amplify-checkbox e2e:', () => {
	it('should render amplify-checkbox with no label', async () => {
		const page = await newE2EPage();
		await page.setContent(`<amplify-checkbox></amplify-checkbox>`);
		const el = await page.find('amplify-checkbox');
		expect(el).not.toBeNull();

		const screenshot = await page.compareScreenshot('amplify-checkbox', {
			fullPage: true,
		});
		expect(screenshot).toMatchScreenshot({
			allowableMismatchedPixels: pixelThreshold,
		});
	});

	it('should render amplify-checkbox with label', async () => {
		const page = await newE2EPage();
		await page.setContent(
			`<amplify-checkbox label="Seattle"></amplify-checkbox>`
		);
		const el = await page.find('amplify-checkbox');
		expect(el).not.toBeNull();

		const screenshot = await page.compareScreenshot('amplify-checkbox-label', {
			fullPage: true,
		});
		expect(screenshot).toMatchScreenshot({
			allowableMismatchedPixels: pixelThreshold,
		});
	});

	it('should have a checkbox checked', async () => {
		const page = await newE2EPage();
		await page.setContent(
			`<amplify-checkbox label="Boise"></amplify-checkbox>`
		);

		const checkboxEl = await page.find('amplify-checkbox');
		expect(checkboxEl).not.toBeNull();

		checkboxEl.setProperty('checked', true);

		await page.waitForChanges();

		const checked = await checkboxEl.getProperty('checked');

		expect(checked).toBe(true);
	});
});
