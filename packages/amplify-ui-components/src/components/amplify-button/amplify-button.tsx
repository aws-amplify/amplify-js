import { Component, Prop, h } from '@stencil/core';
import { ButtonTypes } from '../../common/types/ui-types';

@Component({
  tag: 'amplify-button',
  styleUrl: 'amplify-button.scss',
  shadow: true,
})
export class AmplifyButton {
  /** Type of the button: 'button', 'submit' or 'reset' */
  @Prop() type: ButtonTypes = 'button';
  /** (Optional) Callback called when a user clicks on the button */
  @Prop() handleButtonClick: (evt: Event) => void;
  /** (Optional) Override default styling */
  @Prop() overrideStyle: boolean = false;

  render() {
    return (
      <button
        class={{
          button: true,
        }}
        type={this.type}
        onClick={this.handleButtonClick}
      >
        <slot />
      </button>
    );
  }
}
