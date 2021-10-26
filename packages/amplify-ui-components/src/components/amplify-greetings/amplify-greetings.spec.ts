import { newSpecPage } from '@stencil/core/testing';
import { AmplifyGreetings } from './amplify-greetings';

describe('amplify-greetings spec:', () => {
	describe('Component logic ->', () => {
		let greetings;

		beforeEach(() => {
			greetings = new AmplifyGreetings();
		});

		it('should have username prop set to null by default', () => {
			expect(greetings.username).toBe(null);
		});

		it('should have logo prop set to null by default', () => {
			expect(greetings.logo).toBe(null);
		});
	});
	describe('Render logic ->', () => {
		it('should render', async () => {
			const page = await newSpecPage({
				components: [AmplifyGreetings],
				html: `<amplify-greetings></amplify-greetings>`,
			});

			expect(page.root).toMatchSnapshot();
		});
	});
});
