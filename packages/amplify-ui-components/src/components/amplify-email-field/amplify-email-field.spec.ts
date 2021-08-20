import { newSpecPage } from '@stencil/core/testing';
import { AmplifyEmailField } from './amplify-email-field';

describe('amplify-email-field spec:', () => {
	describe('Component logic ->', () => {
		let emailField;

		beforeEach(() => {
			emailField = new AmplifyEmailField();
		});

		it('should render `email` for the field id', () => {
			expect(emailField.fieldId).toEqual('email');
		});

		it('should have `label` render to `Email Address *` by default', () => {
			expect(emailField.label).toEqual('Email Address *');
		});

		it('should have `placeholder` render to `Enter your email address` by default', () => {
			expect(emailField.placeholder).toEqual('Enter your email address');
		});

		it('should have `required` set to `false` by default', () => {
			expect(emailField.required).toBe(false);
		});
	});
	describe('Render logic ->', () => {
		it('should render `placeholder` and `label values', async () => {
			const page = await newSpecPage({
				components: [AmplifyEmailField],
				html: `<amplify-email-field label="New email *" placeholder="Enter new email address"></amplify-email-field>`,
			});

			expect(page.root).toMatchSnapshot();
		});

		it('should render default values by default', async () => {
			const page = await newSpecPage({
				components: [AmplifyEmailField],
				html: `<amplify-email-field></amplify-email-field>`,
			});

			expect(page.root).toMatchSnapshot();
		});
	});
});
