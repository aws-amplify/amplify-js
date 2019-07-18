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
  @Prop() primaryColor: string = '#FF9900';

  render() {
    return (
      <button class={button} role={this.role} type={this.type} style={{ 'background-color': this.primaryColor }}>
        <slot />
      </button>
    );
  }
}
