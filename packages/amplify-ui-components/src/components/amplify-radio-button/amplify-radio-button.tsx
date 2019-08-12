import { Component, Prop, h } from '@stencil/core';
import { radioButton } from './amplify-radio-button.style';
import { styleNuker } from '../../common/helpers';
import { AMPLIFY_UI_RADIO_BUTTON } from '../../common/constants';

@Component({
  tag: 'amplify-radio-button',
  shadow: false,
})
export class AmplifyRadioButton {
  /** (optional) Whether or not to override default styling */
  @Prop() styleOverride?: boolean = false;
  /** Type of input for this component is radio */
  @Prop() readonly type: string = 'radio';
  /** (optional) Name of radio button */
  @Prop() name?: string;
  /** (optional) Value of radio button */
  @Prop() value?: string;
  /** Field ID used for the 'for' in the label */
  @Prop() fieldId: string;
  /** Label for the radio button */
  @Prop() label: string;

  render() {
    return (
      <span class={styleNuker(this.styleOverride, AMPLIFY_UI_RADIO_BUTTON, radioButton)}>
        <input
          type={this.type}
          name={this.name}
          value={this.value}
        />
        <amplify-label htmlFor={this.fieldId}>{this.label}</amplify-label>
      </span>
    );
  }
}