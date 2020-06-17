import { Component, Prop, h, State, Host } from '@stencil/core';
import { NO_STORAGE_MODULE_FOUND } from '../../common/constants';
import { AccessLevel } from '../../common/types/storage-types';
import { Storage } from '@aws-amplify/storage';
import { Logger, I18n } from '@aws-amplify/core';
import { calcKey, getStorageObject } from '../../common/helpers';
import { Translations } from '../../common/Translations';

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
  /* Title string value */
  @Prop() headerTitle?: string = I18n.get(Translations.IMAGE_PICKER_TITLE);
  /* Header Hint value in string */
  @Prop() headerHint?: string = I18n.get(Translations.IMAGE_PICKER_HINT);
  /* Placeholder hint that goes under the placeholder image */
  @Prop() placeholderHint?: string = I18n.get(Translations.IMAGE_PICKER_PLAEHOLDER_HINT);
  /* Upload Button Text as string */
  @Prop() buttonText?: string = I18n.get(Translations.IMAGE_PICKER_BUTTON_TEXT);

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
