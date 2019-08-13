import { Component, Prop, h } from '@stencil/core';
import { checkbox } from './amplify-checkbox.style';
import { styleNuker } from '../../common/helpers';
import { AMPLIFY_UI_PREFIX } from '../../common/constants';

const staticCheckboxClassName = `${AMPLIFY_UI_PREFIX}--checkbox`;

@Component({
  tag: 'amplify-checkbox',
  shadow: false,
})
export class AmplifyCheckbox {
  /** (Optional) Overrides default styling */
  @Prop() styleOverride?: boolean = false;
  /** Name of the checkbox */
  @Prop() name?: string;
  /** Value of the checkbox */
  @Prop() value?: string;
  /** Field ID used for the 'htmlFor' in the label */
  @Prop() fieldId: string;
  /** Label for the checkbox */
  @Prop() label: string;
  /** If `true`, the checkbox is selected. */
  @Prop() checked: boolean = false;
  /** If `true`, the checkbox is disabled */
  @Prop() disabled: boolean = false;

  render() {
    return (
      <span class={styleNuker(this.styleOverride, staticCheckboxClassName, checkbox)}>
        <input
          type="checkbox"
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