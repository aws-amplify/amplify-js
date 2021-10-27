import { newSpecPage } from '@stencil/core/testing';
import { AmplifyHint } from './amplify-hint';

describe('amplify-hint spec:', () => {
	describe('Render logic ->', () => {
		it('renders with no hint text', async () => {
			const page = await newSpecPage({
				components: [AmplifyHint],
				html: `<amplify-hint></amplify-hint>`,
			});

			expect(page.root).toMatchSnapshot();
		});
		it('renders with hint text FOO', async () => {
			const page = await newSpecPage({
				components: [AmplifyHint],
				html: `<amplify-hint>FOO</amplify-hint>`,
			});

			expect(page.root).toMatchSnapshot();
		});
	});
});
