import { newSpecPage } from '@stencil/core/testing';
import { AmplifyLink } from './amplify-link';

describe('amplify-link spec:', () => {
	describe('Render logic ->', () => {
		it('should render a link by default', async () => {
			const page = await newSpecPage({
				components: [AmplifyLink],
				html: `<amplify-link></amplify-link>`,
			});

			expect(page.root).toMatchSnapshot();
		});

		it('should render only class `amplify-ui--link`', async () => {
			const page = await newSpecPage({
				components: [AmplifyLink],
				html: `<amplify-link></amplify-link>`,
			});

			expect(page.root).toMatchSnapshot();
		});
	});
});
