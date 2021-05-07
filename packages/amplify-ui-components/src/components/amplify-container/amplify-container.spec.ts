import { newSpecPage } from '@stencil/core/testing';
import { AmplifyContainer } from './amplify-container';

describe('amplify-container spec:', () => {
	describe('Render logic ->', () => {
		it('should render with an empty slot', async () => {
			const page = await newSpecPage({
				components: [AmplifyContainer],
				html: `<amplify-container></amplify-container>`,
			});

			expect(page.root).toMatchSnapshot();
		});

		it('should render with contained content when content is passed in', async () => {
			const page = await newSpecPage({
				components: [AmplifyContainer],
				html: `<amplify-container><div>My App</div></amplify-container>`,
			});

			expect(page.root).toMatchSnapshot();
		});
	});
});
