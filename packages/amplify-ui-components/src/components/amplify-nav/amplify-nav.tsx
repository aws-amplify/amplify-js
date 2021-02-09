import { Component, h } from '@stencil/core';

@Component({
  tag: 'amplify-nav',
  styleUrl: 'amplify-nav.scss',
  scoped: true,
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
