import { Component, Element, Prop, h } from '@stencil/core';
import { button } from './amplify-button.style';
import { styleNuker } from '../../common/helpers';
import { AMPLIFY_UI_BUTTON } from '../../common/constants';

@Component({
  tag: 'amplify-button',
  shadow: false,
})
export class AmplifyButton {
  @Element() el: HTMLElement;

  @Prop() type: string = 'button';
  @Prop() role: string = 'button';
  @Prop() styleOverride: boolean = false;

  render() {
    return (
      <button class={styleNuker(this.styleOverride, AMPLIFY_UI_BUTTON, button)} role={this.role} type={this.type}>
        <slot />
      </button>
    );
  }
}
