import { Component, h } from '@stencil/core';
import { nav } from './amplify-nav.style';

@Component({
  tag: 'amplify-nav',
  shadow: false,
})
export class AmplifyNav {
  render() {
    return (
      <nav class={nav}>
        <slot />
      </nav>
    );
  }
}
