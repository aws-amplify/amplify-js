import { Component, h, Prop } from '@stencil/core';
import { hint } from './amplify-hint.style';
import { styleNuker } from '../../common/helpers';
import { AMPLIFY_UI_HINT } from '../../common/constants';
@Component({
  tag: 'amplify-hint',
  shadow: false,
})

export class AmplifyHint {
  @Prop() overrideStyle: boolean = false;

  render() {
    return (
      <div class={styleNuker(this.overrideStyle, AMPLIFY_UI_HINT, hint)}>
        <slot />
      </div>
    );
  }
}
