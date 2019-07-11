import { Component, h } from '@stencil/core';
import { hint } from './amplify-hint.style';
@Component({
  tag: 'amplify-hint',
  shadow: false,
})
export class AmplifyHint {
  render() {
    return (
      <div class={hint}>
        <slot />
      </div>
    );
  }
}
