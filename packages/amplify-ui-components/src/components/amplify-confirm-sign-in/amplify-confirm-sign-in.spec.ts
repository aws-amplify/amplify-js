import { newSpecPage } from '@stencil/core/testing';
import { AmplifyConfirmSignIn } from './amplify-confirm-sign-in';
import { Translations } from '../../common/Translations';

describe('amplify-confirm-sign-in spec:', () => {
	describe('Component logic ->', () => {
		let confirmSignIn;

		beforeEach(() => {
			confirmSignIn = new AmplifyConfirmSignIn();
		});

		it('should render `handleSubmit` as defined by default', () => {
			expect(confirmSignIn.handleSubmit).toBeDefined();
		});

		it('should render `validationErrors` as undefined by default', () => {
			expect(confirmSignIn.validationErrors).toBeUndefined();
		});

		it('should render `headerText` to `Confirm SMS Code` by default', () => {
			expect(confirmSignIn.headerText).toEqual(Translations.CONFIRM_SMS_CODE);
		});

		it('should render `submitButtonText` to `Confirm` by default', () => {
			expect(confirmSignIn.submitButtonText).toEqual(Translations.CONFIRM);
		});

		it('should have default formFields by default', () => {
			expect(confirmSignIn.formFields).toHaveLength(1);
			expect(confirmSignIn.formFields[0].type).toBe('code');
			expect(confirmSignIn.formFields[0].required).toBe(true);
			expect(confirmSignIn.formFields[0].handleInputChange).toBeDefined();
			expect(typeof confirmSignIn.formFields[0].handleInputChange).toBe('function');
		});

		it('setup should have been called on componentWillLoad', () => {
			jest.spyOn(confirmSignIn, 'setup');
			confirmSignIn.componentWillLoad();
			expect(confirmSignIn.setup).toHaveBeenCalledWith();
		});

		it('constructFormFieldOptions should have been called during setup', () => {
			jest.spyOn(confirmSignIn, 'constructFormFieldOptions');
			expect(confirmSignIn.constructedFormFieldOptions).toBeUndefined();
			confirmSignIn.setup();
			expect(confirmSignIn.constructFormFieldOptions)
				.toHaveBeenCalledWith(confirmSignIn.formFields);
			expect(confirmSignIn.constructedFormFieldOptions).toBeDefined();
		});

		it('constructFormFieldOptions should work as expected', () => {
			expect(confirmSignIn.constructFormFieldOptions()).toBeUndefined();
			expect(confirmSignIn.constructFormFieldOptions([]))
				.toEqual(confirmSignIn.defaultFormFields);
			expect(confirmSignIn.constructFormFieldOptions(['foo', 'bar']))
				.toEqual(['foo', 'bar']);

			let retVal = confirmSignIn.constructFormFieldOptions([{
				type: 'text',
			}]);
			expect(retVal).toHaveLength(1);
			expect(retVal[0].type).toBe('text');
			expect(retVal[0].handleInputChange).not.toBeDefined();

			retVal = confirmSignIn.constructFormFieldOptions([{
				type: 'code',
			}]);
			expect(retVal).toHaveLength(1);
			expect(retVal[0].type).toBe('code');
			expect(retVal[0].handleInputChange).toBeDefined();
			expect(typeof retVal[0].handleInputChange).toBe('function');
		});
	});
	describe('Render logic ->', () => {
		it('should render a `confirm sign in` form by default', async () => {
			const page = await newSpecPage({
				components: [AmplifyConfirmSignIn],
				html: `<amplify-confirm-sign-in></amplify-confirm-sign-in>`,
			});

			expect(page.root).toMatchSnapshot();
		});
	});
});
