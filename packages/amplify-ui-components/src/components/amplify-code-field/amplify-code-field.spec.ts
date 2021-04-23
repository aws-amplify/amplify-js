import { newSpecPage } from '@stencil/core/testing';
import { AmplifyCodeField } from './amplify-code-field';

describe('amplify-code-field spec:', () => {
	describe('Component logic ->', () => {
		let codeField;

		beforeEach(() => {
			codeField = new AmplifyCodeField();
		});

		it('should render `code` for the field id', () => {
			expect(codeField.fieldId).toEqual('code');
		});

		it('should have `label` render to `Verification code` by default', () => {
			expect(codeField.label).toEqual('Verification code');
		});

		it('should have `placeholder` render to `Enter code` by default', () => {
			expect(codeField.placeholder).toEqual('Enter code');
		});

		it('should have `required` set to `false` by default', () => {
			expect(codeField.required).toBe(false);
		});
	});
	describe('Render logic ->', () => {
		it('should render `placeholder` and `label values', async () => {
			const page = await newSpecPage({
				components: [AmplifyCodeField],
				html: `<amplify-code-field label="New code *" placeholder="Enter new code"></amplify-code-field>`,
			});

			expect(page.root).toMatchSnapshot();
		});

		it('should render default values by default', async () => {
			const page = await newSpecPage({
				components: [AmplifyCodeField],
				html: `<amplify-code-field></amplify-code-field>`,
			});

			expect(page.root).toMatchSnapshot();
		});
	});
});
