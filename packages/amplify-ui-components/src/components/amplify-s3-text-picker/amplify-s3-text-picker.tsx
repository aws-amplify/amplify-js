import { Component, Prop, h, State, Host } from '@stencil/core';
import { AccessLevel } from '../../common/types/storage-types';
import { Storage } from '@aws-amplify/storage';
import { Logger, I18n } from '@aws-amplify/core';
import { NO_STORAGE_MODULE_FOUND } from '../../common/constants';
import { calcKey } from '../../common/helpers';
import { Translations } from '../../common/Translations';

const logger = new Logger('S3TextPicker');

@Component({
  tag: 'amplify-s3-text-picker',
})
export class AmplifyS3TextPicker {
  /* String representing directory location to text file */
  @Prop() path: string;
  /* The content type header used when uploading to S3 */
  @Prop() contentType: string = 'text/*';
  /* The access level of the image */
  @Prop() level: AccessLevel = AccessLevel.Public;
  /* Whether or not to use track the get/put of the image */
  @Prop() track: boolean;
  /* Cognito identity id of the another user's image */
  @Prop() identityId: string;
  /* Callback used to generate custom key value */
  @Prop() fileToKey: (data: object) => string;
  /* Source content of text */
  @State() src: string;

  async handleInput(event: Event) {
    const file = (event.target as HTMLInputElement).files[0];

    if (!file) {
      throw new Error('No file was selected');
    }

    const { path = '', level, fileToKey, track } = this;
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
      logger.debug('handle pick data', data);
      this.src = key;
    } catch (error) {
      logger.debug(error);
      throw new Error(error);
    }
  }

  render() {
    return (
      <Host>
        <amplify-s3-text
          textKey={this.src}
          path={this.path}
          level={this.level}
          track={this.track}
          identityId={this.identityId}
          contentType={this.contentType}
          fallbackText={I18n.get(Translations.PICKER_TEXT)}
        />
        <amplify-picker inputHandler={e => this.handleInput(e)} acceptValue={'text/*'}></amplify-picker>
      </Host>
    );
  }
}
