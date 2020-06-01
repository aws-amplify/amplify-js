import { newSpecPage } from '@stencil/core/testing';
import { AmplifyS3ImagePicker } from './amplify-s3-image-picker';

describe('amplify-s3-image spec:', () => {
  describe('Component logic ->', () => {
    let amplifyS3ImagePicker;

    beforeEach(() => {
      amplifyS3ImagePicker = new AmplifyS3ImagePicker();
    });

    it('`contentType` should be set to `binary/octet-stream` by default', () => {
      expect(amplifyS3ImagePicker.contentType).toBe('binary/octet-stream');
    });

    it('`level` should be set to `public` by default', () => {
      expect(amplifyS3ImagePicker.level).toBe('public');
    });
  });

  describe('Render logic ->', () => {
    it(`should render no img element without 'imgKey' or 'path'`, async () => {
      const page = await newSpecPage({
        components: [AmplifyS3ImagePicker],
        html: `<amplify-s3-image-picker />`,
      });
      expect(page.root).toMatchSnapshot();
    });
  });
});
