import { Component, Prop, h } from '@stencil/core';
import { CODE_SUFFIX, CODE_LABEL, CODE_PLACEHOLDER } from '../../common/constants';

@Component({
  tag: 'amplify-code-field',
  shadow: false,
})
export class AmplifyCodeField {
  /** Based on the type of field e.g. sign in, sign up, forgot password, etc. */
  @Prop() fieldId: string = CODE_SUFFIX;
  /** Used for the code label */
  @Prop() label: string = CODE_LABEL;
  /** Used for the placeholder label */
  @Prop() placeholder: string = CODE_PLACEHOLDER;
  /** The required flag in order to make an input required prior to submitting a form */
  @Prop() required: boolean = false;
  /** The callback, called when the input is modified by the user. */
  @Prop() handleInputChange?: (inputEvent: Event) => void;
  /** The value of the content inside of the input field */
  @Prop() value: string;

  render() {
    return (
      <amplify-form-field
        fieldId={this.fieldId}
        label={this.label}
        placeholder={this.placeholder}
        type="number"
        required={this.required}
        handleInputChange={this.handleInputChange}
        value={this.value}
      />
    );
  }
}
