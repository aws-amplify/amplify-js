import { newSpecPage } from '@stencil/core/testing';
import { AmplifyAuthFields } from './amplify-auth-fields';

describe('amplify-auth-fields spec:', () => {
	describe('Component logic ->', () => {
		let authFields;

		beforeEach(() => {
			authFields = new AmplifyAuthFields();
		});

		it('should return form fields as being defined when passing FormFieldTypes', () => {
			const constructFormFieldOptionsMock = jest.spyOn(
				authFields,
				'constructFormFieldOptions'
			);
			const result = [
				{ type: 'username', label: 'New username' },
				{ type: 'password', label: 'New password' },
			];

			authFields.formFields = [
				{ type: 'username', label: 'New username' },
				{ type: 'password', label: 'New password' },
			];

			authFields.constructFormFieldOptions();

			expect(authFields.formFields).toEqual(result);
			expect(constructFormFieldOptionsMock).toHaveBeenCalledTimes(1);
		});

		it('should return form fields as being defined when passing `username` and `password` as parameter', () => {
			const constructFormFieldOptionsMock = jest.spyOn(
				authFields,
				'constructFormFieldOptions'
			);
			const result = ['username', 'password'];

			authFields.formFields = ['username', 'password'];

			authFields.constructFormFieldOptions();

			expect(authFields.formFields).toEqual(result);
			expect(constructFormFieldOptionsMock).toHaveBeenCalledTimes(1);
		});

		it('should return the formFields as undefined by default', () => {
			expect(authFields.formFields).toBeUndefined();
		});
	});
	describe('Render logic ->', () => {
		it('should render with a `username` and `password` field', async () => {
			const usernameField = ['username', 'password'];

			const page = await newSpecPage({
				components: [AmplifyAuthFields],
			});

			const component = page.doc.createElement('amplify-auth-fields');
			(component as any).formFields = usernameField;
			page.body.appendChild(component);
			await page.waitForChanges();

			expect(page.root).toMatchSnapshot();
		});

		it('should render with no default values and a empty string', async () => {
			const page = await newSpecPage({
				components: [AmplifyAuthFields],
				html: `<amplify-auth-fields></amplify-auth-fields>`,
			});

			expect(page.root).toMatchSnapshot();
		});

		it('should render custom type fields', async () => {
			const customField = [{ label: 'date', type: 'date' }];

			const page = await newSpecPage({
				components: [AmplifyAuthFields],
			});

			const component = page.doc.createElement('amplify-auth-fields');
			(component as any).formFields = customField;
			page.body.appendChild(component);
			await page.waitForChanges();

			expect(page.root).toMatchSnapshot();
		});
	});
});
