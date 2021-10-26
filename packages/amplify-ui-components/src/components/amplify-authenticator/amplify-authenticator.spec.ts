import { newSpecPage } from '@stencil/core/testing';
import { AmplifyAuthenticator } from './amplify-authenticator';

describe('amplify-authenticator spec:', () => {
	describe('Component logic ->', () => {
		let authenticator;

		beforeEach(() => {
			authenticator = new AmplifyAuthenticator();
		});

		it('should render `authState` as `loading` by default', () => {
			expect(authenticator.authState).toEqual('loading');
		});
	});
	describe('Render logic ->', () => {
		it('should render a `sign up` if initialAuthState is `signup`', async () => {
			const page = await newSpecPage({
				components: [AmplifyAuthenticator],
				html: `<amplify-authenticator initial-auth-state="signup"></amplify-authenticator>`,
			});

			expect(page.root).toMatchSnapshot();
		});
		it('should render a `forgot password` if initialAuthState is `forgotpassword`', async () => {
			const page = await newSpecPage({
				components: [AmplifyAuthenticator],
				html: `<amplify-authenticator initial-auth-state="forgotpassword"></amplify-authenticator>`,
			});

			expect(page.root).toMatchSnapshot();
		});

		it('should render a `sign in` by default', async () => {
			const page = await newSpecPage({
				components: [AmplifyAuthenticator],
				html: `<amplify-authenticator></amplify-authenticator>`,
			});

			expect(page.root).toMatchSnapshot();
		});
	});
});
