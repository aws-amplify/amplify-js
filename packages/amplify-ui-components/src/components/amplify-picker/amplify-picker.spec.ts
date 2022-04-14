import { newSpecPage } from '@stencil/core/testing';
import { AmplifyPicker } from './amplify-picker';
import { I18n } from '@aws-amplify/core';
import { Translations } from '../../common/Translations';

describe('amplify-picker spec:', () => {
	describe('Component logic ->', () => {
		let amplifyPicker;

		beforeEach(() => {
			amplifyPicker = new AmplifyPicker();
		});

		it('`pickerText` should be defined by default', () => {
			expect(amplifyPicker.pickerText).toBe(I18n.get(Translations.PICKER_TEXT));
		});

		it('`acceptValue` should be `*/*` by default', () => {
			expect(amplifyPicker.acceptValue).toBe('*/*');
		});
	});

	describe('Render logic ->', () => {
		it('should render a picker by default', async () => {
			const page = await newSpecPage({
				components: [AmplifyPicker],
				html: `<amplify-picker></amplify-picker>`,
			});

			expect(page.root).toMatchSnapshot();
		});
	});
});
