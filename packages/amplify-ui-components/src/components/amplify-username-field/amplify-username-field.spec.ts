import { newSpecPage } from '@stencil/core/testing';
import { AmplifyUsernameField } from './amplify-username-field';

describe('amplify-username-field spec:', () => {
	describe('Component logic ->', () => {
		let usernameField;

		beforeEach(() => {
			usernameField = new AmplifyUsernameField();
		});

		it('should render `username` for the field id', () => {
			expect(usernameField.fieldId).toEqual('username');
		});

		it('should have `label` render to `Username *` by default', () => {
			expect(usernameField.label).toEqual('Username *');
		});

		it('should have `placeholder` render to `Enter your username` by default', () => {
			expect(usernameField.placeholder).toEqual('Enter your username');
		});

		it('should have `required` set to `false` by default', () => {
			expect(usernameField.required).toBe(false);
		});
	});
	describe('Render logic ->', () => {
		it('should render `placeholder` and `label values', async () => {
			const page = await newSpecPage({
				components: [AmplifyUsernameField],
				html: `<amplify-username-field label="New username *" placeholder="Enter new user name"></amplify-username-field>`,
			});

			expect(page.root).toMatchSnapshot();
		});

		it('should render default values by default', async () => {
			const page = await newSpecPage({
				components: [AmplifyUsernameField],
				html: `<amplify-username-field></amplify-username-field>`,
			});

			expect(page.root).toMatchSnapshot();
		});
	});
});
