import { newSpecPage } from '@stencil/core/testing';
import { AmplifyPhotoPicker } from './amplify-photo-picker';
import { I18n } from '@aws-amplify/core';
import { Translations } from '../../common/Translations';

describe('amplify-photo-picker spec:', () => {
	describe('Component logic ->', () => {
		let amplifyPhotoPicker;

		beforeEach(() => {
			amplifyPhotoPicker = new AmplifyPhotoPicker();
		});

		it('`headerTitle` should be defined by default', () => {
			expect(amplifyPhotoPicker.headerTitle).toBe(
				I18n.get(Translations.PHOTO_PICKER_TITLE)
			);
		});

		it('`headerHint` should be defined by default', () => {
			expect(amplifyPhotoPicker.headerHint).toBe(
				I18n.get(Translations.PHOTO_PICKER_HINT)
			);
		});

		it('`placeholderHint` should be defined by default', () => {
			expect(amplifyPhotoPicker.placeholderHint).toBe(
				I18n.get(Translations.PHOTO_PICKER_PLACEHOLDER_HINT)
			);
		});

		it('`buttonText` should be defined by default', () => {
			expect(amplifyPhotoPicker.buttonText).toBe(
				I18n.get(Translations.PHOTO_PICKER_BUTTON_TEXT)
			);
		});

		it('`previewSrc` should be undefined by default', () => {
			expect(amplifyPhotoPicker.previewSrc).toBeUndefined();
		});
	});

	describe('Render logic ->', () => {
		it('should render a picker by default', async () => {
			const page = await newSpecPage({
				components: [AmplifyPhotoPicker],
				html: `<amplify-photo-picker></amplify-photo-picker>`,
			});

			expect(page.root).toMatchSnapshot();
		});
	});
});
