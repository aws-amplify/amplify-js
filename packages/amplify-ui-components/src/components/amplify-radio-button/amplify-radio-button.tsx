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
  /** (Optional) Overrides default styling */
  @Prop() styleOverride?: boolean = false;
  /** (Optional) Name of radio button */
  @Prop() name?: string;
  /** (Optional) Value of radio button */
  @Prop() value?: string;
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
      <span class={styleNuker(this.styleOverride, STATIC_RADIO_BUTTON_CLASS_NAME, radioButton)}>
        <input
          type="radio"
          name={this.name}
          value={this.value}
          id={this.fieldId}
          checked={this.checked}
          disabled={this.disabled}
        />
        <amplify-label htmlFor={this.fieldId}>{this.label}</amplify-label>
      </span>
    );
  }
}