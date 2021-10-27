import { newSpecPage } from '@stencil/core/testing';
import { AmplifyTOTPSetup } from './amplify-totp-setup';

describe('amplify-totp spec:', () => {
	describe('Component logic ->', () => {
		let totpSetup;

		beforeEach(() => {
			totpSetup = new AmplifyTOTPSetup();
		});

		it('should render `user` to be undefined by default', () => {
			expect(totpSetup.user).toBeUndefined();
		});

		it('should have `onTOTPEvent` be Defined', () => {
			expect(totpSetup.onTOTPEvent).toBeDefined();
		});

		it('should have `inputProps` have `autoFocus` set to true by default', () => {
			expect(totpSetup.inputProps.autoFocus).toBe(true);
		});

		it('should have `code` be null by default', () => {
			expect(totpSetup.code).toBeNull();
		});

		it('should have `setUpMessage` be null by default', () => {
			expect(totpSetup.setupMessage).toBeNull();
		});

		it('should have `qrCodeImageSource` be undefined by default', () => {
			expect(totpSetup.qrCodeImageSource).toBeUndefined();
		});

		it('should have `qrCodeInput` be null by default', () => {
			expect(totpSetup.qrCodeInput).toBeNull();
		});
	});
	describe('Render logic ->', () => {
		it('should render a `less than 2 mfa types available` message by default', async () => {
			const page = await newSpecPage({
				components: [AmplifyTOTPSetup],
				html: `<amplify-totp-setup></amplify-totp-setup>`,
			});

			expect(page.root).toMatchSnapshot();
		});
	});
});
