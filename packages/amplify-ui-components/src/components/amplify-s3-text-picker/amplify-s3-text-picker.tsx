import { Component, Prop, h, State, Host } from '@stencil/core';
import { Logger, I18n } from '@aws-amplify/core';
import { AccessLevel } from '../../common/types/storage-types';
import { calcKey, getTextSource, putStorageObject } from '../../common/storage-helper';
import { Translations } from '../../common/Translations';

const logger = new Logger('S3TextPicker');

@Component({
  tag: 'amplify-s3-text-picker',
  styleUrl: 'amplify-s3-text-picker.scss',
  shadow: true,
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
  @Prop() fileToKey: (data: object) => string | string;
  /* Source content of text */
  @State() src: string = I18n.get(Translations.PICKER_TEXT);

  private async handleInput(event: Event) {
    const file = (event.target as HTMLInputElement).files[0];

    const { path = '', level, fileToKey, track, identityId } = this;
    const key = path + calcKey(file, fileToKey);

    try {
      await putStorageObject(key, file, level, track, file['type'], logger);
      this.src = await getTextSource(key, level, track, identityId, logger);
    } catch (error) {
      logger.debug(error);
      throw new Error(error);
    }
  }

  render() {
    return (
      <Host>
        <div class="text-container">
          <pre>{this.src}</pre>
        </div>
        <amplify-picker inputHandler={e => this.handleInput(e)} acceptValue={'text/*'}></amplify-picker>
      </Host>
    );
  }
}
