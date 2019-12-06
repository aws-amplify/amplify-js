import { Component, Host, h, Prop } from '@stencil/core';

import { strike, strikeContent } from './amplify-strike.style';
import { AMPLIFY_UI_PREFIX } from '../../common/constants';
import { styleNuker } from '../../common/helpers';

const STATIC_STRIKE_CLASS_NAME = `${AMPLIFY_UI_PREFIX}--strike`;

@Component({
  tag: 'amplify-strike',
  shadow: false,
})
export class AmplifyStrike {
  /** (Optional) Override default styling */
  @Prop() overrideStyle: boolean = false;

  render() {
    return (
      <Host class={styleNuker(this.overrideStyle, STATIC_STRIKE_CLASS_NAME, strike)}>
        <span class={styleNuker(this.overrideStyle, STATIC_STRIKE_CLASS_NAME, strikeContent)}>
          <slot />
        </span>
      </Host>
    );
  }
}
