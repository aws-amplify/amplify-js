import { Component, Prop, h } from '@stencil/core';
import { navBar } from './amplify-nav-bar.style';

@Component({
  tag: 'amplify-nav-bar',
  shadow: false,
})
export class AmplifyNavBar {
  @Prop() navItems: Array<object>;

  render() {
    return (
      <nav class={navBar} role="navigation">
        <slot />
      </nav>
    );
  }
}
