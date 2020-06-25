import { newSpecPage } from '@stencil/core/testing';
import { AmplifyS3Album } from './amplify-s3-album';
import { AccessLevel } from '../../common/types/storage-types';

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
