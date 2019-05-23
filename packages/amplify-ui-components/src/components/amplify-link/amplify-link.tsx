import { Component, Element, Prop, h } from '@stencil/core';
import { link } from './amplify-link.style';

@Component({
  tag: 'amplify-link',
  shadow: false,
})
export class AmplifyLink {
  @Element() el: HTMLElement;

  @Prop() role: string = 'navigation';

  render() {
    return (
      <a class={link} role={this.role}>
        <slot />
      </a>
    );
  }
}
