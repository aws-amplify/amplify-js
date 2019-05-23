import { Component, Element, Prop, h } from '@stencil/core';
import { button } from './amplify-button.style';

@Component({
  tag: 'amplify-button',
  shadow: false,
})
export class AmplifyButton {
  @Element() el: HTMLElement;

  @Prop() type: string = 'button';
  @Prop() role: string = 'button';

  render() {
    return (
      <button class={button} role={this.role} type={this.type}>
        <slot />
      </button>
    );
  }
}
