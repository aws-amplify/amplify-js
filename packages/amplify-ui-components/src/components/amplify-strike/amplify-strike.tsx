import { Component, h } from '@stencil/core';

@Component({
  tag: 'amplify-strike',
  styleUrl: 'amplify-strike.scss',
  scoped: true,
})
export class AmplifyStrike {
  render() {
    return (
      <span class="strike-content">
        <slot />
      </span>
    );
  }
}
