import { newSpecPage } from '@stencil/core/testing';
import { AmplifyButton } from './amplify-button';

describe('amplify-button spec:', () => {
	describe('Render logic ->', () => {
		it('renders with no button text', async () => {
			const page = await newSpecPage({
				components: [AmplifyButton],
				html: `<amplify-button></amplify-button>`,
			});

			expect(page.root).toMatchSnapshot();
		});
		it('renders with button text FOO', async () => {
			const page = await newSpecPage({
				components: [AmplifyButton],
				html: `<amplify-button>FOO</amplify-button>`,
			});

			expect(page.root).toMatchSnapshot();
		});
		it('renders with danger class when button type is reset', async () => {
			const page = await newSpecPage({
				components: [AmplifyButton],
				html: `<amplify-button type='reset'>FOO</amplify-button>`,
			});

			expect(page.root).toMatchSnapshot();
		});
	});
	describe('Component logic ->', () => {
		it(`should have type 'button' by default`, async () => {
			const button = new AmplifyButton();
			expect(button.type).toBe('button');
		});
	});
});
