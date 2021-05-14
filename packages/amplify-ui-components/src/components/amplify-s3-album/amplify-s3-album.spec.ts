import { newSpecPage } from '@stencil/core/testing';
import { AmplifyS3Album } from './amplify-s3-album';
import { AccessLevel } from '../../common/types/storage-types';
import { I18n } from '@aws-amplify/core';
import { Translations } from '../../common/Translations';

describe('amplify-s3-album spec:', () => {
	describe('Component logic ->', () => {
		let amplifyS3Album;

		beforeEach(() => {
			amplifyS3Album = new AmplifyS3Album();
		});

		it('`path` should be undefined by default', () => {
			expect(amplifyS3Album.path).toBeUndefined();
		});

		it('`contentType` should be set to `binary/octet-stream` by default', () => {
			expect(amplifyS3Album.contentType).toBe('binary/octet-stream');
		});

		it('`level` should be set to `public` by default', () => {
			expect(amplifyS3Album.level).toBe(AccessLevel.Public);
		});

		it('`track` should be undefined by default', () => {
			expect(amplifyS3Album.track).toBeUndefined();
		});

		it('`identityId` should be undefined by default', () => {
			expect(amplifyS3Album.identityId).toBeUndefined();
		});

		it('`fileToKey` should be undefined by default', () => {
			expect(amplifyS3Album.fileToKey).toBeUndefined();
		});

		it('`filter` should be undefined by default', () => {
			expect(amplifyS3Album.filter).toBeUndefined();
		});

		it('`sort` should be undefined by default', () => {
			expect(amplifyS3Album.sort).toBeUndefined();
		});

		it('`picker` should be true by default', () => {
			expect(amplifyS3Album.picker).toBe(true);
		});

		it('`handleOnLoad` should be undefined by default', () => {
			expect(amplifyS3Album.handleOnLoad).toBeUndefined();
		});

		it('`handleOnError` should be undefined by default', () => {
			expect(amplifyS3Album.handleOnError).toBeUndefined();
		});

		it('`pickerText` should be defined by default', () => {
			expect(amplifyS3Album.pickerText).toBe(
				I18n.get(Translations.PICKER_TEXT)
			);
		});
	});

	describe('Render logic ->', () => {
		it(`should render album`, async () => {
			const page = await newSpecPage({
				components: [AmplifyS3Album],
				html: `<amplify-s3-album />`,
			});
			expect(page.root).toMatchSnapshot();
		});
	});
});
