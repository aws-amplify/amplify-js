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

  @Prop() pickerEnabled: boolean = true;
  @Prop() overrideStyle: boolean = false;
  @Prop() handleOnLoad: () => {};
  @Prop() handleOnError: () => {};

  @State() src: string | Object = null;

  async getSrc(key) {
    try {
      this.src = await Storage.get(key);
    } catch (error) {
      console.log(error);
    }
    // let user = await Auth.currentAuthenticatedUser();
    // console.log(user);
  }

  async putContent() {
    try {
      const key = await Storage.put('testprivate.txt', 'Hello', { level: 'private' });
      console.log(key);
    } catch (error) {
      console.log(error);
    }
  }

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
      <Host class={styleNuker(this.overrideStyle, STATIC_LINK_CLASS_NAME, image)}>
        {this.src && <img src={this.src as string} onLoad={this.handleOnLoad} onError={this.handleOnError} />}
        {this.pickerEnabled && <button onClick={() => this.putContent()}>{/* Add Picker component here */}Put</button>}
        <button onClick={() => this.getSrc('amplify-logo.png')}>{/* Add Picker component here */}Get</button>
      </Host>
    );
  }
}
