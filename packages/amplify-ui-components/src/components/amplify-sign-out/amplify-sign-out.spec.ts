import { I18n } from '@aws-amplify/core';
import { newSpecPage } from '@stencil/core/testing';
import { AmplifySignOut } from './amplify-sign-out';
import { Translations } from '../../common/Translations';

describe('amplify-sign-out spec:', () => {
	describe('Component logic ->', () => {
		let signOut;

		beforeEach(() => {
			signOut = new AmplifySignOut();
		});

		it('should render default `buttonText`', () => {
			expect(signOut.buttonText).toEqual(I18n.get(Translations.SIGN_OUT));
		});
	});
	describe('Render logic ->', () => {
		it('should render a `sign out` button by default', async () => {
			const page = await newSpecPage({
				components: [AmplifySignOut],
				html: `<amplify-sign-out></amplify-sign-out>`,
			});

			expect(page.root).toMatchSnapshot();
		});
	});
});
