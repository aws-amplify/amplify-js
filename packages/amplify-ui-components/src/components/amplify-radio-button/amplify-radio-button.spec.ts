import { newSpecPage } from '@stencil/core/testing';
import { AmplifyRadioButton } from './amplify-radio-button';

describe('amplify-radio-button spec:', () => {
	describe('Component logic ->', () => {
		let radio;

		beforeEach(() => {
			radio = new AmplifyRadioButton();
		});

		it('should render false for checked prop by default', () => {
			expect(radio.checked).toBe(false);
		});

		it('should render false for disabled prop by default', () => {
			expect(radio.disabled).toBe(false);
		});
	});
	describe('Render logic ->', () => {
		it('should render a radio button with no label and a type of radio for input by default', async () => {
			const page = await newSpecPage({
				components: [AmplifyRadioButton],
				html: `<amplify-radio-button></amplify-radio-button>`,
			});

			expect(page.root).toMatchSnapshot();
		});

		it('should render only class `amplify-ui--radio-button`', async () => {
			const page = await newSpecPage({
				components: [AmplifyRadioButton],
				html: `<amplify-radio-button></amplify-radio-button>`,
			});

			expect(page.root).toMatchSnapshot();
		});
	});
});
