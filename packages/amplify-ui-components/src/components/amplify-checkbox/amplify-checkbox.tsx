import { Component, Prop, h } from '@stencil/core';
import { checkbox } from './amplify-checkbox.style';
import { styleNuker } from '../../common/helpers';
import { AMPLIFY_UI_PREFIX } from '../../common/constants';

const STATIC_CHECKBOX_CLASS_NAME = `${AMPLIFY_UI_PREFIX}--checkbox`;

@Component({
  tag: 'amplify-checkbox',
  shadow: false,
})
export class AmplifyCheckbox {
  /** (Optional) Overrides default styling */
  @Prop() overrideStyle: boolean = false;
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

  private onClick = () => {
    this.checked = !this.checked;
  }

  render() {
    return (
      <span class={styleNuker(this.overrideStyle, STATIC_CHECKBOX_CLASS_NAME, checkbox)}>
        <input
          onClick={this.onClick}
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