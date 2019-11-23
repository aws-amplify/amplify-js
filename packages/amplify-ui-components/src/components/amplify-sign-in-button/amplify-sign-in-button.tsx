import { Component, h, Prop, Host } from '@stencil/core';

import { signInButton } from './amplify-sign-in-button.style';
import { icons, IconNameType } from '../amplify-icon/icons';
import { AMPLIFY_UI_PREFIX } from '../../common/constants';
import { styleNuker } from '../../common/helpers';

const STATIC_SIGN_IN_BUTTON_CLASS_NAME = `${AMPLIFY_UI_PREFIX}--sign-in-button`;

@Component({
  tag: 'amplify-sign-in-button',
  shadow: false,
})
export class AmplifySignInButton {
  /** (Optional) Override default styling */
  @Prop() overrideStyle: boolean = false;
  @Prop() provider: 'amazon' | 'auth0' | 'facebook' | 'google' | 'oauth';

  render() {
    const className = styleNuker(this.overrideStyle, STATIC_SIGN_IN_BUTTON_CLASS_NAME, signInButton);

    return (
      <Host class={`${className} ${this.provider}`}>
        <button>
          {this.provider in icons && (
            <span class="icon">
              <amplify-icon name={this.provider as IconNameType} />
            </span>
          )}

          <span class="content">
            <slot />
          </span>
        </button>
      </Host>
    );
  }
}
