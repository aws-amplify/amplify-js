import { newSpecPage } from '@stencil/core/testing';
import { AmplifyForgotPassword } from './amplify-forgot-password';
import { Translations } from '../../common/Translations';

describe('amplify-forgot-password spec:', () => {
	describe('Component logic ->', () => {
		let amplifyForgotPassword;

		beforeEach(() => {
			amplifyForgotPassword = new AmplifyForgotPassword();
		});

		it('`headerText` should be set by default', () => {
			expect(amplifyForgotPassword.headerText).toBe(
				Translations.RESET_YOUR_PASSWORD
			);
		});

		it('`sendButtonText` should be set by default', () => {
			expect(amplifyForgotPassword.sendButtonText).toBe(Translations.SEND_CODE);
		});

		it('`submitButtonText` should be set by default', () => {
			expect(amplifyForgotPassword.submitButtonText).toBe(Translations.SUBMIT);
		});

		it('should render `usernameAlias` as `username` by default', () => {
			expect(amplifyForgotPassword.usernameAlias).toEqual('username');
		});
	});
	describe('Render logic ->', () => {
		it(`should render`, async () => {
			const page = await newSpecPage({
				components: [AmplifyForgotPassword],
				html: `<amplify-forgot-password />`,
			});
			expect(page.root).toMatchSnapshot();
		});
	});
});
