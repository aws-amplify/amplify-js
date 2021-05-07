import { newSpecPage } from '@stencil/core/testing';
import { AmplifyPasswordField } from './amplify-password-field';

describe('amplify-password-field spec:', () => {
	describe('Component logic ->', () => {
		let passwordField;

		beforeEach(() => {
			passwordField = new AmplifyPasswordField();
		});

		it('should render hint to `undefined` by default', () => {
			expect(passwordField.hint).toBeUndefined();
		});

		it('should render placeholder to `Enter your password` by default', () => {
			expect(passwordField.placeholder).toEqual('Enter your password');
		});

		it('should render label to `Password *` by default', () => {
			expect(passwordField.label).toEqual('Password *');
		});

		it('should render fieldId to `password` by default', () => {
			expect(passwordField.fieldId).toEqual('password');
		});

		it('should render required to `false` by default', () => {
			expect(passwordField.required).toBe(false);
		});
	});
	describe('Render logic ->', () => {
		it('should render with `label` and `placeholder` values changed', async () => {
			const page = await newSpecPage({
				components: [AmplifyPasswordField],
				html: `<amplify-password-field label="New password *" placeholder="Enter new password"></amplify-password-field>`,
			});

			expect(page.root).toMatchSnapshot();
		});

		it('should render with default values', async () => {
			const page = await newSpecPage({
				components: [AmplifyPasswordField],
				html: `<amplify-password-field></amplify-password-field>`,
			});

			expect(page.root).toMatchSnapshot();
		});
	});
});
