import { Component, Host, h } from '@stencil/core';

import * as classNames from './amplify-strike.style';

@Component({
  tag: 'amplify-strike',
  shadow: false,
})
export class AmplifyStrike {
  render() {
    return (
      <Host class={classNames.Host}>
        <span>
          <slot />
        </span>
      </Host>
    );
  }
}
