import { Component, Element, Prop, h, State, Host } from '@stencil/core';
import { image } from './amplify-s3-image.style';
import { styleNuker } from '../../common/helpers';
import { AMPLIFY_UI_PREFIX, NO_STORAGE_MODULE_FOUND } from '../../common/constants';
import { AccessLevel } from '../../common/types/storage-types';
import { Storage } from '@aws-amplify/storage';
import { Logger } from '@aws-amplify/core';

const logger = new Logger('S3Image');

const STATIC_LINK_CLASS_NAME = `${AMPLIFY_UI_PREFIX}--s3-image`;

@Component({
  tag: 'amplify-s3-image',
  shadow: false,
})
export class AmplifyS3Image {
  @Element() el: HTMLElement;

  /* The key of the image object in S3 */
  @Prop() imgKey: string;
  /* String representing directory location to image file */
  @Prop() path: string;
  /* Image body content to be uploaded */
  @Prop() body: object;
  /* The content type header used when uploading to S3 */
  @Prop() contentType: string = 'binary/octet-stream';
  /* The access level of the image */
  @Prop() level: AccessLevel = AccessLevel.Public;
  /* Whether or not to use track the get/put of the image */
  @Prop() track: boolean;
  /* Cognito identity id of the another user's image */
  @Prop() identityId: string;
  /* Whether or not the photo picker is enabled */
  @Prop() pickerEnabled: boolean = false;
  /* Whether or not to hide the image */
  @Prop() hidden: boolean = false;
  /** Override default styling */
  @Prop() overrideStyle: boolean = false;
  /* Callback used to generate custom key value */
  @Prop() fileToKey: (data: object) => string;
  /* Function executed when image loads */
  @Prop() handleOnLoad: (event: Event) => void;
  /* Function executed when error occurs for the image */
  @Prop() handleOnError: (event: Event) => void;

  @State() src: string | object;

  async componentWillLoad() {
    // await this.load();
  }

  async load() {
    const { imgKey, path, body, contentType, level, track, identityId } = this;
    if (!imgKey && !path) {
      logger.debug('empty imgKey and path');
      return;
    }

    const key = imgKey || path;
    logger.debug('loading ' + key + '...');
    if (body) {
      if (!Storage || typeof Storage.put !== 'function') {
        throw new Error(NO_STORAGE_MODULE_FOUND);
      }

      try {
        const data = Storage.put(key, body, {
          contentType,
          level,
          track,
        });
        logger.debug(data);
        this.src = await this.getImageSource(key, level, track, identityId);
      } catch (error) {
        logger.error(error);
        throw new Error(error);
      }
    } else {
      this.src = await this.getImageSource(key, level, track, identityId);
    }
  }

  async getImageSource(key, level, track, identityId) {
    if (!Storage || typeof Storage.get !== 'function') {
      throw new Error(NO_STORAGE_MODULE_FOUND);
    }

    try {
      const src = await Storage.get(key, { level, track, identityId });
      return src;
    } catch (error) {
      logger.error(error);
      throw new Error(error);
    }
  }

  async onChange(e) {
    const { imgKey, path, level, track, identityId } = this;
    const key = imgKey || path;

    const file = e.target.files[0];
    console.log(file);
    if (!Storage || typeof Storage.put !== 'function') {
      throw new Error(NO_STORAGE_MODULE_FOUND);
    }
    try {
      // const data = await Storage.put(key, file, {
      //   contentType: 'image/png',
      //   level,
      //   track,
      // });
      const data = await Storage.put('test.txt', 'Hello!');
      logger.debug(data);
      this.src = await this.getImageSource(key, level, track, identityId);
    } catch (error) {
      logger.error(error);
      throw new Error(error);
    }
  }

  render() {
    return (
      <Host class={styleNuker(this.overrideStyle, STATIC_LINK_CLASS_NAME, image)}>
        {this.src && <img src={this.src as string} onLoad={this.handleOnLoad} onError={this.handleOnError} />}
        {/* TODO: add PhotoPicker */}
        <input type="file" accept="image/png" onChange={e => this.onChange(e)} />
      </Host>
    );
  }
}
