import { Component, h, Prop, Host } from '@stencil/core';
import { cx } from 'emotion';

import * as classNames from './amplify-sign-in-button.style';
import { icons, IconNameType } from '../amplify-icon/icons';

@Component({
  tag: 'amplify-sign-in-button',
  shadow: false,
})
export class AmplifySignInButton {
  @Prop() provider: 'amazon' | 'auth0' | 'facebook' | 'google' | 'oauth';

  render() {
    return (
      <Host class={cx(this.provider, classNames.Host)}>
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
