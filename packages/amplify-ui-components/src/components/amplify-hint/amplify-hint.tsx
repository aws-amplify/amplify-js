import { Component, h } from '@stencil/core';

@Component({
  tag: 'amplify-hint',
  styleUrl: 'amplify-hint.scss',
  shadow: true,
})
export class AmplifyHint {
  render() {
    return (
      <div class="hint">
        <slot />
      </div>
    );
  }
}
