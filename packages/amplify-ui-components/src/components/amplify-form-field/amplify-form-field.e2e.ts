import { newE2EPage, E2EPage } from '@stencil/core/testing';
import { pixelThreshold, selectors } from '../../common/testing';

describe('amplify-form-field e2e:', () => {
	let page: E2EPage;

	beforeEach(async () => {
		page = await newE2EPage();
	});

	it('renders with label, description, and hint', async () => {
		await page.setContent(
			`<amplify-form-field field-id="id" label="Label test" description="Description test" hint="Hint test" placeholder="Placeholder test"></amplify-form-field>`
		);
		const screenshot = await page.compareScreenshot('Amplify Form Field', {
			fullPage: true,
		});
		expect(screenshot).toMatchScreenshot({
			allowableMismatchedPixels: pixelThreshold,
		});

		const fieldElement = await page.find('amplify-form-field');
		expect(fieldElement).not.toBeNull();

		const labelElement = await page.find('label');
		expect(labelElement).toEqualText('Label test');
		expect(labelElement).toEqualAttribute('for', 'id');

		const descriptionElement = await page.find(selectors.formFieldDescription);
		expect(descriptionElement).toEqualText('Description test');
	});

	it('renders no label, description, or hint if none are provided', async () => {
		await page.setContent(`<amplify-form-field></amplify-form-field>`);

		const labelElement = await page.find('label');
		expect(labelElement).toBeNull();

		const descriptionElement = await page.find(selectors.formFieldDescription);
		expect(descriptionElement).toBeNull();
	});

	it('fires an onInputChange event when the contents of the box are changed', async () => {
		await page.setContent(`<amplify-form-field></amplify-form-field>`);

		const func = jest.fn();
		await page.exposeFunction('exposedfunc', func);

		await page.$eval('amplify-form-field', (fieldElement: any) => {
			fieldElement.handleInputChange = this.exposedfunc;
			fieldElement.label = 'adding a label so that the component rerenders';
		});
		await page.waitForChanges();

		const input = await page.find('input');
		await input.press('8');
		expect(func).toBeCalledTimes(1);
		expect(func.mock.calls[0][0].isTrusted).toBe(true);
		const value = await input.getProperty('value');
		expect(value).toBe('8');
	});

	it('can have a checkbox input', async () => {
		await page.setContent(
			`<amplify-form-field type='checkbox'></amplify-form-field>`
		);
		await page.waitForChanges();

		const input = await page.find('input');
		expect(input).toEqualAttribute('type', 'checkbox');
	});

	it('can have a number input', async () => {
		await page.setContent(
			`<amplify-form-field type='number'></amplify-form-field>`
		);
		await page.waitForChanges();

		const input = await page.find('input');
		expect(input).toEqualAttribute('type', 'number');
	});
});
