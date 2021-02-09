import { Component, h } from '@stencil/core';

@Component({
  tag: 'amplify-nav',
  styleUrl: 'amplify-nav.scss',
})
export class AmplifyNav {
  render() {
    return (
      <nav class="nav">
        <slot />
      </nav>
    );
  }
}
