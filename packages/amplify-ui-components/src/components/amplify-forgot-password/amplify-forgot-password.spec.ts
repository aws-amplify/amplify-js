import { Auth } from '@aws-amplify/auth';
import { newSpecPage } from '@stencil/core/testing';
import { AmplifyForgotPassword } from './amplify-forgot-password';
import { Translations } from '../../common/Translations';

describe('amplify-forgot-password spec:', () => {
	describe('Component logic ->', () => {
		let amplifyForgotPassword;

		beforeEach(() => {
			Auth.forgotPassword = jest.fn().mockResolvedValue({
				CodeDeliveryDetails: 'CodeDeliveryDetails mocked value',
			});
			Auth.forgotPasswordSubmit = jest.fn().mockResolvedValue({});
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

		it('should trim the `userInput` text on `send`', async () => {
			const event = { preventDefault: jest.fn() };
			amplifyForgotPassword.forgotPasswordAttrs.userInput = 'foo ';
			const promise = amplifyForgotPassword.send(event);
			expect(event.preventDefault).toHaveBeenCalledWith();
			expect(amplifyForgotPassword.loading).toBe(true);
			expect(Auth.forgotPassword).toHaveBeenCalledWith(
				amplifyForgotPassword.forgotPasswordAttrs.userInput.trim());
			expect(amplifyForgotPassword.delivery).toBe(null);
			await promise;
			expect(amplifyForgotPassword.delivery).toBe('CodeDeliveryDetails mocked value');
			expect(amplifyForgotPassword.loading).toBe(false);
		});

		it('should trim the `userInput` text on `submit`', async () => {
			const event = { preventDefault: jest.fn() };
			amplifyForgotPassword.forgotPasswordAttrs.userInput = 'foo ';
			amplifyForgotPassword.delivery = 'bar';
			const promise = amplifyForgotPassword.submit(event);
			expect(event.preventDefault).toHaveBeenCalledWith();
			expect(amplifyForgotPassword.loading).toBe(true);
			expect(Auth.forgotPasswordSubmit).toHaveBeenCalledWith(
				amplifyForgotPassword.forgotPasswordAttrs.userInput.trim(),
				amplifyForgotPassword.forgotPasswordAttrs.code,
				amplifyForgotPassword.forgotPasswordAttrs.password);
			expect(amplifyForgotPassword.delivery).toBe('bar');
			await promise;
			expect(amplifyForgotPassword.delivery).toBeNull();
			expect(amplifyForgotPassword.loading).toBe(false);
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
