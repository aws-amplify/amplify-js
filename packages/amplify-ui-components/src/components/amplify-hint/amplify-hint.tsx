import { Component, h, Prop } from '@stencil/core';
import { hint } from './amplify-hint.style';
import { styleNuker } from '../../common/helpers';
import { AMPLIFY_UI_PREFIX } from '../../common/constants';

const STATIC_HINT_CLASS_NAME = `${AMPLIFY_UI_PREFIX}--hint`;

@Component({
  tag: 'amplify-hint',
  shadow: false,
})

export class AmplifyHint {
  @Prop() overrideStyle: boolean = false;

  render() {
    return (
      <div class={styleNuker(this.overrideStyle, STATIC_HINT_CLASS_NAME, hint)}>
        <slot />
      </div>
    );
  }
}
