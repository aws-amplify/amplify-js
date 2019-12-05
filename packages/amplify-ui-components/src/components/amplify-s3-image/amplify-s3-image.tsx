import { Component, Element, Prop, h, State, Host } from '@stencil/core';
import { image } from './amplify-s3-image.style';
import { styleNuker } from '../../common/helpers';
import { AMPLIFY_UI_PREFIX, NO_STORAGE_MODULE_FOUND } from '../../common/constants';
// import { Auth } from '@aws-amplify/auth';
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

  @Prop() imgKey: string;
  @Prop() path: string;
  @Prop() body: object;
  @Prop() contentType: string;
  @Prop() level: string;
  @Prop() track: boolean;
  @Prop() identityId: string;
  @Prop() pickerEnabled: boolean = true;
  @Prop() overrideStyle: boolean = false;
  @Prop() handleOnLoad: () => {};
  @Prop() handleOnError: () => {};

  @State() src: string | Object = null;

  async componentWillLoad() {
    await this.load();
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
      const type = contentType || 'binary/octet-stream';
      if (!Storage || typeof Storage.put !== 'function') {
        throw new Error('No Storage module found, please ensure @aws-amplify/storage is imported');
      }

      try {
        const data = Storage.put(key, body, {
          contentType: type,
          level: level ? level : 'public',
          track,
        });
        logger.debug(data);
        await this.getImageSource(key, level, track, identityId);
      } catch (error) {
        logger.error(error);
        throw new Error(error);
      }
    } else {
      await this.getImageSource(key, level, track, identityId);
    }
  }

  async getImageSource(key, level, track, identityId) {
    if (!Storage || typeof Storage.get !== 'function') {
      throw new Error(NO_STORAGE_MODULE_FOUND);
    }

    try {
      const src = await Storage.get(key, { level: level ? level : 'public', track, identityId });
      console.log(src);
      this.src = src;
    } catch (error) {
      logger.error(error);
      throw new Error(error);
    }
  }

  handleClick(event) {
    console.log(event);
    console.log(Storage);
  }

  render() {
    return (
      <Host class={styleNuker(this.overrideStyle, STATIC_LINK_CLASS_NAME, image)}>
        {this.src && <img src={this.src as string} onLoad={this.handleOnLoad} onError={this.handleOnError} />}
      </Host>
    );
  }
}

/* 

*/
