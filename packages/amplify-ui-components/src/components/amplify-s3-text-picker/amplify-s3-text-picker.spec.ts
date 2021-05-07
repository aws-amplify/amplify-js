import { newSpecPage } from '@stencil/core/testing';
import { AmplifyS3TextPicker } from './amplify-s3-text-picker';
import { AccessLevel } from '../../common/types/storage-types';

describe('amplify-s3-image spec:', () => {
	describe('Component logic ->', () => {
		let amplifyS3TextPicker;

		beforeEach(() => {
			amplifyS3TextPicker = new AmplifyS3TextPicker();
		});

		it('`path` should be undefined by default', () => {
			expect(amplifyS3TextPicker.path).toBeUndefined();
		});

		it('`contentType` should be set to `text/*` by default', () => {
			expect(amplifyS3TextPicker.contentType).toBe('text/*');
		});

		it('`level` should be set to `public` by default', () => {
			expect(amplifyS3TextPicker.level).toBe(AccessLevel.Public);
		});

		it('`track` should be undefined by default', () => {
			expect(amplifyS3TextPicker.track).toBeUndefined();
		});

		it('`identityId` should be undefined by default', () => {
			expect(amplifyS3TextPicker.identityId).toBeUndefined();
		});

		it('`fileToKey` should be undefined by default', () => {
			expect(amplifyS3TextPicker.fileToKey).toBeUndefined();
		});
	});

	describe('Render logic ->', () => {
		it(`should render no pre tag without 'path'`, async () => {
			const page = await newSpecPage({
				components: [AmplifyS3TextPicker],
				html: `<amplify-s3-text-picker />`,
			});
			expect(page.root).toMatchSnapshot();
		});
	});
});
