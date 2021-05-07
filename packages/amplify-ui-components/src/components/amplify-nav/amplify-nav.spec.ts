import { newSpecPage } from '@stencil/core/testing';
import { AmplifyNav } from './amplify-nav';

describe('amplify-nav spec:', () => {
	describe('Render logic ->', () => {
		it('should render', async () => {
			const page = await newSpecPage({
				components: [AmplifyNav],
				html: `<amplify-nav></amplify-nav>`,
			});

			expect(page.root).toMatchSnapshot();
		});
	});
});
