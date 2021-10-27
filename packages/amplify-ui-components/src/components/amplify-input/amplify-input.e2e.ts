import { newE2EPage } from '@stencil/core/testing';
import { pixelThreshold } from '../../common/testing';

describe('amplify-input e2e:', () => {
	it('renders with placeholder', async () => {
		const page = await newE2EPage();

		await page.setContent(
			`<amplify-input field-id="id" description="Description test" placeholder="Placeholder test"></amplify-input>`
		);
		const screenshot = await page.compareScreenshot('Amplify Input', {
			fullPage: true,
		});
		expect(screenshot).toMatchScreenshot({
			allowableMismatchedPixels: pixelThreshold,
		});

		const inputElement = await page.find('amplify-input');
		expect(inputElement).not.toBeNull();
	});

	it('fires an onInputChange event when the contents of the box are changed', async () => {
		const page = await newE2EPage();

		await page.setContent(`<amplify-input></amplify-input>`);

		const func = jest.fn();
		await page.exposeFunction('exposedfunc', func);

		await page.$eval('amplify-input', (inputElement: any) => {
			inputElement.handleInputChange = this.exposedfunc;
			inputElement.label = 'adding a label so that the component rerenders';
		});
		await page.waitForChanges();

		const input = await page.find('input');
		await input.press('8');
		await input.press('a');
		await input.press('$');
		expect(func).toBeCalledTimes(3);
		expect(func.mock.calls[0][0].isTrusted).toBe(true);
		const value = await input.getProperty('value');
		expect(value).toBe('8a$');
	});

	it('prevents adding text to a numeric input', async () => {
		const page = await newE2EPage();

		await page.setContent(`<amplify-input type="number"></amplify-input>`);

		const func = jest.fn();
		await page.exposeFunction('exposedfunc', func);

		await page.$eval('amplify-input', (inputElement: any) => {
			inputElement.handleInputChange = this.exposedfunc;
			inputElement.label = 'adding a label so that the component rerenders';
		});
		await page.waitForChanges();

		const input = await page.find('input');
		await input.press('8');
		await input.press('a');
		await input.press('$');
		expect(func).toBeCalledTimes(1);
		expect(func.mock.calls[0][0].isTrusted).toBe(true);
		const value = await input.getProperty('value');
		expect(value).toBe('8');
	});

	it('can have a checkbox input', async () => {
		const page = await newE2EPage();

		await page.setContent(`<amplify-input type='checkbox'></amplify-input>`);
		await page.waitForChanges();

		const input = await page.find('input');
		expect(input).toEqualAttribute('type', 'checkbox');
	});

	it('can have a number input', async () => {
		const page = await newE2EPage();

		await page.setContent(`<amplify-input type='number'></amplify-input>`);
		await page.waitForChanges();

		const input = await page.find('input');
		expect(input).toEqualAttribute('type', 'number');
	});
});
