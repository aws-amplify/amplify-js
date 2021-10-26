import { newSpecPage } from '@stencil/core/testing';
import { I18n } from '@aws-amplify/core';
import { AmplifyS3ImagePicker } from './amplify-s3-image-picker';
import { AccessLevel } from '../../common/types/storage-types';
import { Translations } from '../../common/Translations';

describe('amplify-s3-image spec:', () => {
	describe('Component logic ->', () => {
		let amplifyS3ImagePicker;

		beforeEach(() => {
			amplifyS3ImagePicker = new AmplifyS3ImagePicker();
		});

		it('`path` should be undefined by default', () => {
			expect(amplifyS3ImagePicker.path).toBeUndefined();
		});

		it('`contentType` should be set to `binary/octet-stream` by default', () => {
			expect(amplifyS3ImagePicker.contentType).toBe('binary/octet-stream');
		});

		it('`level` should be set to `public` by default', () => {
			expect(amplifyS3ImagePicker.level).toBe(AccessLevel.Public);
		});

		it('`track` should be undefined by default', () => {
			expect(amplifyS3ImagePicker.track).toBeUndefined();
		});

		it('`identityId` should be undefined by default', () => {
			expect(amplifyS3ImagePicker.identityId).toBeUndefined();
		});

		it('`fileToKey` should be undefined by default', () => {
			expect(amplifyS3ImagePicker.fileToKey).toBeUndefined();
		});

		it('`headerTitle` should have value by default', () => {
			expect(amplifyS3ImagePicker.headerTitle).toBe(
				I18n.get(Translations.IMAGE_PICKER_TITLE)
			);
		});

		it('`headerHint` should have value by default', () => {
			expect(amplifyS3ImagePicker.headerHint).toBe(
				I18n.get(Translations.IMAGE_PICKER_HINT)
			);
		});

		it('`placeholderHint` should have value by default', () => {
			expect(amplifyS3ImagePicker.placeholderHint).toBe(
				I18n.get(Translations.IMAGE_PICKER_PLACEHOLDER_HINT)
			);
		});

		it('`buttonText` should have value by default', () => {
			expect(amplifyS3ImagePicker.buttonText).toBe(
				I18n.get(Translations.IMAGE_PICKER_BUTTON_TEXT)
			);
		});
	});

	describe('Render logic ->', () => {
		it(`should render no photo picker without 'path'`, async () => {
			const page = await newSpecPage({
				components: [AmplifyS3ImagePicker],
				html: `<amplify-s3-image-picker />`,
			});
			expect(page.root).toMatchSnapshot();
		});
	});
});
