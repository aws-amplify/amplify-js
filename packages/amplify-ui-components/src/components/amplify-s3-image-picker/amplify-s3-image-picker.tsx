import { Component, Prop, h, State, Host } from '@stencil/core';
import { NO_STORAGE_MODULE_FOUND } from '../../common/constants';
import { AccessLevel } from '../../common/types/storage-types';
import { Storage } from '@aws-amplify/storage';
import { Logger } from '@aws-amplify/core';
import { calcKey, getStorageObject } from '../../common/helpers';

const logger = new Logger('S3ImagePicker');

@Component({
  tag: 'amplify-s3-image-picker',
})
export class AmplifyS3ImagePicker {
  /* String representing directory location to image file */
  @Prop() path: string;
  /* The content type header used when uploading to S3 */
  @Prop() contentType: string = 'binary/octet-stream';
  /* The access level of the image */
  @Prop() level: AccessLevel = AccessLevel.Public;
  /* Whether or not to use track the get/put of the image */
  @Prop() track: boolean;
  /* Cognito identity id of the another user's image */
  @Prop() identityId: string;
  /* Callback used to generate custom key value */
  @Prop() fileToKey: (data: object) => string;
  @Prop() headerTitle?: string = 'Add Profile Photos';
  @Prop() headerHint?: string = 'Ancilliary text or content may occupy this space here';
  @Prop() placeholderHint?: string = 'Placeholder hint';
  @Prop() buttonText?: string = 'Upload';

  @State() src: string | object;

  async handlePick(file) {
    const { path = '', level, track, identityId, fileToKey } = this;
    const key = path + calcKey(file, fileToKey);

    if (!Storage || typeof Storage.put !== 'function') {
      throw new Error(NO_STORAGE_MODULE_FOUND);
    }

    try {
      const data = await Storage.put(key, file, {
        level,
        contentType: file['type'],
        track,
      });
      logger.debug(data);
      this.src = await getStorageObject(key, level, track, identityId, logger);
    } catch (error) {
      logger.error(error);
      throw new Error(error);
    }
  }

  render() {
    return (
      <Host>
        <slot name="photo-picker">
          <amplify-photo-picker
            previewSrc={this.src}
            onClickHandler={this.handlePick}
            headerTitle={this.headerTitle}
            headerHint={this.headerHint}
            placeholderHint={this.placeholderHint}
            buttonText={this.buttonText}
          ></amplify-photo-picker>
        </slot>
      </Host>
    );
  }
}
