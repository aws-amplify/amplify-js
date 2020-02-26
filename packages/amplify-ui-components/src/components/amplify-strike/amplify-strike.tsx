import { Component, Host, h } from '@stencil/core';

@Component({
  tag: 'amplify-strike',
  styleUrl: 'amplify-strike.scss',
  scoped: true,
})
export class AmplifyStrike {
  render() {
    return (
      <Host>
        <span class="strike-content">
          <slot />
        </span>
      </Host>
    );
  }
}
