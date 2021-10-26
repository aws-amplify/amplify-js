import { newSpecPage } from '@stencil/core/testing';
import { AmplifyInput } from './amplify-input';

describe('amplify-input spec:', () => {
	describe('Render logic ->', () => {
		it('renders correct HTML', async () => {
			const page = await newSpecPage({
				components: [AmplifyInput],
				html: `<amplify-input></amplify-input>`,
			});

			expect(page.root).toMatchSnapshot();
		});

		it('renders with a name for the input', async () => {
			const page = await newSpecPage({
				components: [AmplifyInput],
				html: `<amplify-input name="seattle"></amplify-input>`,
			});

			expect(page.root).toMatchSnapshot();
		});

		it('renders with complex prop: inputProps spread on the input element', async () => {
			const page = await newSpecPage({
				components: [AmplifyInput],
				html: `<div></div>`,
			});

			const cmp = page.doc.createElement('amplify-input');
			(cmp as any).inputProps = {
				autocomplete: 'off',
				min: '3',
				max: '10',
			};
			page.root.appendChild(cmp);
			await page.waitForChanges();
			expect(page.root).toMatchSnapshot();
		});
	});
	describe('Component logic ->', () => {
		let input;

		beforeEach(() => {
			input = new AmplifyInput();
		});

		it('should have `name` set to undefined by default', () => {
			expect(input.name).toBeUndefined();
		});

		it('should have `description` set to undefined by default', () => {
			expect(input.description).toBeUndefined();
		});

		it('should have `placeholder` set to an empty string by default', () => {
			expect(input.placeholder).toEqual('');
		});

		it('should have `type` set to `text` by default', () => {
			expect(input.type).toEqual('text');
		});

		it('should have `required` set to `false` by default', () => {
			expect(input.required).toBe(false);
		});
	});
});
