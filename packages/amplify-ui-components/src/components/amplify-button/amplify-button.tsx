import { Component, Prop, h } from '@stencil/core';
import { button, buttonTypeReset, buttonTypeSafe } from './amplify-button.style';
import { styleNuker, styleBranch } from '../../common/helpers';
import { ButtonTypes } from '../../common/types';
import { AMPLIFY_UI_PREFIX } from '../../common/constants';

const STATIC_BUTTON_CLASS_NAME = `${AMPLIFY_UI_PREFIX}--button`;

@Component({
  tag: 'amplify-button',
  shadow: false,
})
export class AmplifyButton {
  /** Type of the button: 'button', 'submit' or 'reset' */
  @Prop() type: ButtonTypes = 'button';
  /** (Optional) Callback called when a user clicks on the button */
  @Prop() onButtonClick: (evt: Event) => void;
  /** (Optional) Override default styling */
  @Prop() overrideStyle: boolean = false;

  render() {
    const emotionButtonClass = styleBranch(this.type === 'reset', button, buttonTypeReset, buttonTypeSafe);
    return (
      <button class={styleNuker(this.overrideStyle, STATIC_BUTTON_CLASS_NAME, emotionButtonClass)} type={this.type} onClick={this.onButtonClick}>
        <slot />
      </button>
    );
  }
}
