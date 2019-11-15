import { newSpecPage } from '@stencil/core/testing';
import { AmplifyGreetings } from './amplify-greetings';

describe('amplify-greetings spec:', () => {
	describe('Component logic ->', () => {
		let greetings;

		beforeEach(() => {
			greetings = new AmplifyGreetings();
		});

		it('should render `Submit` for the button text', () => {
			expect(greetings.user).toBe(null);
		});

		it('should have style override prop set to false by default', () => {
			expect(greetings.logo).toBe(null);
		});
	});
	describe('Render logic ->', () => {
		it('should render', async () => {
			const page = await newSpecPage({
				components: [AmplifyGreetings],
				html: `<amplify-greetings></amplify-greetings>`
			});

			expect(page.root).toMatchSnapshot();
		});
	});
});