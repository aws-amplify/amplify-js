import { newSpecPage } from '@stencil/core/testing';
import { AmplifyLabel } from './amplify-label';

describe('amplify-label spec:', () => {
	describe('Render logic ->', () => {
		it('should render a label by default', async () => {
			const page = await newSpecPage({
				components: [AmplifyLabel],
				html: `<amplify-label></amplify-label>`,
			});

			expect(page.root).toMatchSnapshot();
		});

		it('should render only class `amplify-ui--label`', async () => {
			const page = await newSpecPage({
				components: [AmplifyLabel],
				html: `<amplify-label></amplify-label>`,
			});

			expect(page.root).toMatchSnapshot();
		});
	});
});
