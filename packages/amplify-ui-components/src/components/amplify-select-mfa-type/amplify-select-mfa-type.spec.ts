import { newSpecPage } from '@stencil/core/testing';
import { AmplifySelectMFAType } from './amplify-select-mfa-type';

describe('amplify-select-mfa-type spec:', () => {
	describe('Component logic ->', () => {
		let selectMFAType;

		beforeEach(() => {
			selectMFAType = new AmplifySelectMFAType();
		});

		it('should render authData to undefined by default', () => {
			expect(selectMFAType.authData).toBeUndefined();
		});

		it('should render `MFATypes` to undefined by default', () => {
			expect(selectMFAType.MFATypes).toBeUndefined();
		});
	});
	describe('Render logic ->', () => {
		it('should render a `less than 2 MFA types available` message by default', async () => {
			const page = await newSpecPage({
				components: [AmplifySelectMFAType],
				html: `<amplify-select-mfa-type></amplify-select-mfa-type>`,
			});

			expect(page.root).toMatchSnapshot();
		});

		it('should render `TOTP, SMS, No MFA` values', async () => {
			const page = await newSpecPage({
				components: [AmplifySelectMFAType],
				html: `<div></div>`,
			});

			const component = page.doc.createElement('amplify-select-mfa-type');
			(component as any).MFATypes = {
				SMS: true,
				Optional: true,
				TOTP: true,
			};

			page.root.appendChild(component);
			await page.waitForChanges();
			expect(page.root).toMatchSnapshot();
		});
	});
});
