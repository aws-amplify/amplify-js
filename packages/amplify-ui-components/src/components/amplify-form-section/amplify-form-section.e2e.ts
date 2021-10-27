import { newE2EPage, E2EPage } from '@stencil/core/testing';
import { pixelThreshold } from '../../common/testing';

describe('amplify-form-section e2e:', () => {
	let page: E2EPage;

	beforeEach(async () => {
		page = await newE2EPage();
		await page.setContent(`<amplify-form-section></amplify-form-section>`);
	});

	it('should render amplify-form-section with a button text of `Submit`', async () => {
		const el = await page.find('amplify-form-section');
		expect(el).not.toBeNull();

		const screenshot = await page.compareScreenshot('amplify-form-section', {
			fullPage: true,
		});
		expect(screenshot).toMatchScreenshot({
			allowableMismatchedPixels: pixelThreshold,
		});
	});

	it('should change `button label` to `Enter`', async () => {
		const formSectionEl = await page.find('amplify-form-section');
		expect(formSectionEl).not.toBeNull();

		formSectionEl.setProperty('button-label', 'Enter');

		await page.waitForChanges();

		const buttonLabel = await formSectionEl.getProperty('button-label');

		expect(buttonLabel).toEqual('Enter');
	});

	it('should trigger a submit when `Submit` button is clicked', async () => {
		const formSectionEl = await page.find('amplify-form-section');
		const mockFunc = jest.fn();
		await page.exposeFunction('exposedFunc', mockFunc);

		await page.$eval('amplify-form-section', (componentElement: any) => {
			componentElement.handleSubmit = this.exposedFunc;
		});
		await page.waitForChanges();

		const button = await formSectionEl.find('button');
		expect(mockFunc).not.toHaveBeenCalled();

		await button.click();

		expect(mockFunc).toHaveBeenCalledTimes(1);
	});
});
