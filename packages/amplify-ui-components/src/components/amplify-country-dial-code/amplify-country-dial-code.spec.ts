import { newSpecPage } from '@stencil/core/testing';
import { AmplifyCountryDialCode } from './amplify-country-dial-code';

describe('amplify-country-dial-code spec:', () => {
	describe('Component logic ->', () => {
		let countryDialCode;

		beforeEach(() => {
			countryDialCode = new AmplifyCountryDialCode();
		});

		it('should have options be defined by default', () => {
			expect(countryDialCode.options).toBeDefined();
		});
	});
	describe('Render logic ->', () => {
		it('shoulder render a `amplif-select` component with country dial codes as default', async () => {
			const page = await newSpecPage({
				components: [AmplifyCountryDialCode],
				html: `<amplify-country-dial-code></amplify-country-dial-code>`,
			});

			expect(page.root).toMatchSnapshot();
		});
	});
});
