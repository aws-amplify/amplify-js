import { newSpecPage } from '@stencil/core/testing';
import { AmplifyS3Image } from './amplify-s3-image';
import { AccessLevel } from '../../common/types/storage-types';

describe('amplify-s3-image spec:', () => {
	describe('Component logic ->', () => {
		let amplifyS3Image;

		beforeEach(() => {
			amplifyS3Image = new AmplifyS3Image();
		});

		it('`imgKey` should be undefined by default', () => {
			expect(amplifyS3Image.imgKey).toBeUndefined();
		});

		it('`path` should be undefined by default', () => {
			expect(amplifyS3Image.path).toBeUndefined();
		});

		it('`body` should be undefined by default', () => {
			expect(amplifyS3Image.body).toBeUndefined();
		});

		it('`contentType` should be set to `binary/octet-stream` by default', () => {
			expect(amplifyS3Image.contentType).toBe('binary/octet-stream');
		});

		it('`level` should be set to `public` by default', () => {
			expect(amplifyS3Image.level).toBe(AccessLevel.Public);
		});

		it('`track` should be undefined by default', () => {
			expect(amplifyS3Image.track).toBeUndefined();
		});

		it('`identityId` should be undefined by default', () => {
			expect(amplifyS3Image.identityId).toBeUndefined();
		});

		it('`handleOnLoad` should be undefined by default', () => {
			expect(amplifyS3Image.handleOnLoad).toBeUndefined();
		});

		it('`handleOnError` should be undefined by default', () => {
			expect(amplifyS3Image.handleOnError).toBeUndefined();
		});
	});

	describe('Render logic ->', () => {
		it(`should render no img element without 'imgKey' or 'path'`, async () => {
			const page = await newSpecPage({
				components: [AmplifyS3Image],
				html: `<amplify-s3-image />`,
			});
			expect(page.root).toMatchSnapshot();
		});

		it(`should render img element with 'imgKey' or 'path'`, async () => {
			const page = await newSpecPage({
				components: [AmplifyS3Image],
				html: `<amplify-s3-image/>`,
			});
			page.rootInstance.imgKey = 'abc.jpg';
			await page.waitForChanges();

			expect(page.root).toMatchSnapshot();
		});
	});
});
