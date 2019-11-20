import { Component, Element, Prop, h, State, Host } from '@stencil/core';
import { image } from './amplify-s3-image.style';
import { styleNuker } from '../../common/helpers';
import { AMPLIFY_UI_PREFIX, NO_STORAGE_MODULE_FOUND } from '../../common/constants';
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

  @Prop() pickerEnabled: boolean = false;
  @Prop() overrideStyle: boolean = false;
  @Prop() handleOnLoad: () => {};
  @Prop() handleOnError: () => {};

  @State() src: string = 'https://www.systutorials.com/wp/files/2015/11/AmazonS3-e1448589113191.png';

  async getImageSource(key, level, track, identityId) {
    if (!Storage || typeof Storage.get !== 'function') {
      throw new Error(NO_STORAGE_MODULE_FOUND);
    }
    try {
      const src = await Storage.get(key, { level: level ? level : 'public', track, identityId });
      console.log(src);
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
      <Host
        class={styleNuker(this.overrideStyle, STATIC_LINK_CLASS_NAME, image)}
        onClick={event => this.handleClick(event)}
      >
        <img src={this.src} onLoad={this.handleOnLoad} onError={this.handleOnError} />
        {this.pickerEnabled && <button>{/* Add Picker component here */}Picker</button>}
      </Host>
    );
  }
}
