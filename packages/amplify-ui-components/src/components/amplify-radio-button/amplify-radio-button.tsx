import { Component, Prop, h } from '@stencil/core';
import { radioButton } from './amplify-radio-button.style';
import { styleNuker } from '../../common/helpers';
import { AMPLIFY_UI_PREFIX } from '../../common/constants';

const STATIC_RADIO_BUTTON_CLASS_NAME = `${AMPLIFY_UI_PREFIX}--radio-button`;

@Component({
  tag: 'amplify-radio-button',
  shadow: false,
})
export class AmplifyRadioButton {
  /** The callback, called when the input is modified by the user. */
  @Prop() handleInputChange?: (inputEvent: Event) => void;
  /** (Optional) Overrides default styling */
  @Prop() overrideStyle: boolean = false;
  /** (Optional) Name of radio button */
  @Prop() name?: string;
  /** (Optional) Value of radio button */
  @Prop() value?: string;
  /** (Optional) The placeholder for the input element.  Using hints is recommended, but placeholders can also be useful to convey information to users. */
  @Prop() placeholder?: string = '';
  /** Field ID used for the 'for' in the label */
  @Prop() fieldId: string;
  /** Label for the radio button */
  @Prop() label: string;
  /** If `true`, the radio button is selected. */
  @Prop() checked: boolean = false;
  /** If `true`, the checkbox is disabled */
  @Prop() disabled: boolean = false;

  render() {
    return (
      <span class={styleNuker(this.overrideStyle, STATIC_RADIO_BUTTON_CLASS_NAME, radioButton)}>
        <input
          type="radio"
          name={this.name}
          value={this.value}
          onInput={this.handleInputChange}
          placeholder={this.placeholder}
          id={this.fieldId}
          checked={this.checked}
          disabled={this.disabled}
        />
        <amplify-label htmlFor={this.fieldId}>{this.label}</amplify-label>
      </span>
    );
  }
}
