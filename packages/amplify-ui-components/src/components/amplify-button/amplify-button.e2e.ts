import { E2EPage, newE2EPage } from '@stencil/core/testing';
import { pixelThreshold } from '../../common/testing';

describe('amplify-button e2e:', () => {
	let page: E2EPage;

	beforeEach(async () => {
		page = await newE2EPage();
		await page.setContent('<amplify-button>FOO</amplify-button>');
	});

	it(`renders with text 'FOO'`, async () => {
		const element = await page.find('amplify-button');
		expect(element).not.toBeNull();

		const screenshot = await page.compareScreenshot('amplify-form-section', {
			fullPage: true,
		});
		expect(screenshot).toMatchScreenshot({
			allowableMismatchedPixels: pixelThreshold,
		});
	});

	it('fires its onButtonClick callback upon being clicked', async () => {
		const buttonElement = await page.find('amplify-button');
		expect(buttonElement).not.toBeNull();

		const func = jest.fn();
		await page.exposeFunction('exposedfunc', func);

		// This block here, and the .exposeFunction() above, are both necessary
		// if you ever want to pass a function into an object's props
		await page.$eval('amplify-button', (componentElement: any) => {
			componentElement.handleButtonClick = this.exposedfunc;
		});
		await page.waitForChanges();

		const button = await buttonElement.find('button');
		expect(func).not.toHaveBeenCalled();
		await button.click();
		expect(func).toHaveBeenCalledTimes(1);
	});
});
