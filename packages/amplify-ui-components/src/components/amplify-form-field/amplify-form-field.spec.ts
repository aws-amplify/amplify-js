import { newSpecPage } from '@stencil/core/testing';
import { AmplifyFormField } from './amplify-form-field';

describe('amplify-form-field spec:', () => {
	describe('Component logic ->', () => {
		let formField;

		beforeEach(() => {
			formField = new AmplifyFormField();
		});

		it('should have fieldId prop be undefined by default', () => {
			expect(formField.fieldId).toBeUndefined();
		});

		it('should have label prop be undefined by default', () => {
			expect(formField.label).toBeUndefined();
		});

		it('should have description prop be undefined by default', () => {
			expect(formField.description).toBeUndefined();
		});

		it('should have type set to `text` by default', () => {
			expect(formField.type).toEqual('text');
		});

		it('should have required set to false by default', () => {
			expect(formField.required).toBe(false);
		});

		it('should have placeholder prop set to an empty string by default', () => {
			expect(formField.placeholder).toEqual('');
		});

		it('should have name prop be undefined by default', () => {
			expect(formField.name).toBeUndefined();
		});
	});
	describe('Render logic ->', () => {
		it('renders no label or description if none are provided', async () => {
			const page = await newSpecPage({
				components: [AmplifyFormField],
				html: `<amplify-form-field></amplify-form-field>`,
			});

			expect(page.root).toMatchSnapshot();
		});

		it('renders a label and description, if they are provided, and no id', async () => {
			const page = await newSpecPage({
				components: [AmplifyFormField],
				html: `<amplify-form-field label='label' description='description'></amplify-form-field>`,
			});

			expect(page.root).toMatchSnapshot();
		});

		it('renders with an id, if it is provided', async () => {
			const page = await newSpecPage({
				components: [AmplifyFormField],
				html: `<amplify-form-field label='label' description='description' field-id='id'></amplify-form-field>`,
			});

			expect(page.root).toMatchSnapshot();
		});

		it('renders with an name, if it is provided', async () => {
			const page = await newSpecPage({
				components: [AmplifyFormField],
				html: `<amplify-form-field label='label' description='description' field-id='id' name='seattle'></amplify-form-field>`,
			});

			expect(page.root).toMatchSnapshot();
		});

		it('replaces the input component, if a new one is provided', async () => {
			const page = await newSpecPage({
				components: [AmplifyFormField],
				html: `<amplify-form-field label='label' description='description' field-id='id'><input slot="input" /></amplify-form-field>`,
			});

			expect(page.root).toMatchSnapshot();
		});

		it('renders without Emotion CSS classes', async () => {
			const page = await newSpecPage({
				components: [AmplifyFormField],
				html: `<amplify-form-field label='label' description='description' field-id='id'></amplify-form-field>`,
			});

			expect(page.root).toMatchSnapshot();
		});
	});
});
