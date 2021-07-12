import { I18n } from '@aws-amplify/core';
import { newSpecPage } from '@stencil/core/testing';
import { AmplifyRequireNewPassword } from './amplify-require-new-password';
import { Translations } from '../../common/Translations';
import { COUNTRY_DIAL_CODE_DEFAULT } from '../../common/constants';

describe('amplify-require-new-password spec:', () => {
	describe('Component logic ->', () => {
		let requireNewPassword;

		beforeEach(() => {
			requireNewPassword = new AmplifyRequireNewPassword();
		});

		it('should evaluate `handleSubmit` as defined by default', () => {
			expect(requireNewPassword.handleSubmit).toBeDefined();
		});

		it('should evaluate `user` as undefined by default', () => {
			expect(requireNewPassword.user).toBeUndefined();
		});

		it('should evaluate `headerText` to `Change Password` by default', () => {
			expect(requireNewPassword.headerText).toEqual(
				I18n.get(Translations.CHANGE_PASSWORD)
			);
		});

		it('should evaluate `submitButtonText` to `Change` by default', () => {
			expect(requireNewPassword.submitButtonText).toEqual(
				I18n.get(Translations.CHANGE_PASSWORD_ACTION)
			);
		});

		it('should evaluate `phoneNumber` with a valid country code by default', () => {
			expect(requireNewPassword.phoneNumber.countryDialCodeValue).toEqual(
				COUNTRY_DIAL_CODE_DEFAULT
			);
		});
	});
	describe('Render logic ->', () => {
		it('should render default `require new password` form', async () => {
			const page = await newSpecPage({
				components: [AmplifyRequireNewPassword],
				html: `<amplify-require-new-password></amplify-require-new-password>`,
			});

			expect(page.root).toMatchSnapshot();
		});
	});
});
