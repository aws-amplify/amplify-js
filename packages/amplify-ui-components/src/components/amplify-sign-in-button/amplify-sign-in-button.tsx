import { Component, h, Prop, Host } from '@stencil/core';
import { cx } from 'emotion';

import * as classNames from './amplify-sign-in-button.style';

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
          <span class="icon">
            <slot name="icon" />
          </span>

          <span class="content">
            <slot />
          </span>
        </button>
      </Host>
    );
  }
}
