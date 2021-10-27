import { newSpecPage } from '@stencil/core/testing';
import { AmplifyChatbot } from './amplify-chatbot';

describe('amplify-chatbot', () => {
	it('renders chatbot', async () => {
		const page = await newSpecPage({
			components: [AmplifyChatbot],
			html: `<amplify-chatbot />`,
		});
		expect(page.root).toMatchSnapshot();
	});
});
