import { newSpecPage } from '@stencil/core/testing';
import { AmplifyS3Text } from './amplify-s3-text';
import { AccessLevel } from '../../common/types/storage-types';

describe('amplify-s3-image spec:', () => {
	describe('Component logic ->', () => {
		let amplifyS3Text;

		beforeEach(() => {
			amplifyS3Text = new AmplifyS3Text();
		});

		it('`textKey` should be undefined by default', () => {
			expect(amplifyS3Text.textKey).toBeUndefined();
		});

		it('`path` should be undefined by default', () => {
			expect(amplifyS3Text.path).toBeUndefined();
		});

		it('`contentType` should be set to `text/*` by default', () => {
			expect(amplifyS3Text.contentType).toBe('text/*');
		});

		it('`level` should be set to `public` by default', () => {
			expect(amplifyS3Text.level).toBe(AccessLevel.Public);
		});

		it('`track` should be undefined by default', () => {
			expect(amplifyS3Text.track).toBeUndefined();
		});

		it('`identityId` should be undefined by default', () => {
			expect(amplifyS3Text.identityId).toBeUndefined();
		});
	});

	describe('Render logic ->', () => {
		it(`should render no pre tag without 'textKey' or 'path'`, async () => {
			const page = await newSpecPage({
				components: [AmplifyS3Text],
				html: `<amplify-s3-text />`,
			});
			expect(page.root).toMatchSnapshot();
		});
	});
});
