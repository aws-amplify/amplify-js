import { Component, Prop, h } from '@stencil/core';
import { checkbox } from './amplify-checkbox.style';
import { styleNuker } from '../../common/helpers';
import { AMPLIFY_UI_CHECKBOX } from '../../common/constants';

@Component({
  tag: 'amplify-checkbox',
  shadow: false,
})
export class AmplifyCheckbox {
  /** (optional) Whether or not to override default styling */
  @Prop() styleOverride?: boolean = false;
  /** Default to checkbox */
  @Prop() readonly type: string = 'checkbox';
  /** Name of the checkbox */
  @Prop() name?: string;
  /** Value of the checkbox */
  @Prop() value?: string;
  /** (optional) Will toggle the checkbox when set. Default set to false */
  @Prop() checked?: boolean = false;
  /** Field ID used for the 'for' in the label */
  @Prop() fieldId: string;
  /** Label for the checkbox */
  @Prop() label: string;

  render() {
    return (
      <input
        class={styleNuker(this.styleOverride, AMPLIFY_UI_CHECKBOX, checkbox)}
        type={this.type}
        name={this.name}
        value={this.value}
      >
        <amplify-label htmlFor={this.fieldId}>{this.label}</amplify-label>
      </input>
    );
  }
}