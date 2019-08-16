import { Component, Prop, h } from '@stencil/core';
import { formFieldLabel, formFieldDescription } from './amplify-form-field.style';
import { TextFieldTypes } from '../../common/types';

@Component({
  tag: 'amplify-form-field',
  shadow: false,
})
export class AmplifyFormField {
  /** The ID of the field.  Should match with its corresponding input's ID. */
  @Prop() fieldId: string;
  /** The text of the label.  Goes above the input. Ex: 'First name' */
  @Prop() label: string | null;
  /** The text of the description.  Goes between the label and the input. */
  @Prop() description: string | null;
  /** The text of a hint to the user as to how to fill out the input.  Goes just below the input. */
  @Prop() hint: string | null;
  /** The input type.  Can be any HTML input type. */
  @Prop() type?: TextFieldTypes = 'text';
  /** The callback, called when the input is modified by the user. */
  @Prop() onInput?: (inputEvent: Event) => void;
  /** (optional) The placeholder for the input element.  Using hints is recommended, but placeholders can also be useful to convey information to users. */
  @Prop() placeholder?: string = '';

  render() {
    return (
      <div>
        {this.label && (
          <div class={formFieldLabel}>
            <amplify-label htmlFor={this.fieldId}>
              {this.label}
            </amplify-label>
          </div>
        )}
        {this.description && (
          <div id={`${this.fieldId}-description`} class={formFieldDescription} data-test="form-field-description">
            {this.description}
          </div>
        )}
        <div>
          <slot name='input'>
            <amplify-input
              fieldId={this.fieldId}
              description={this.description}
              type={this.type}
              onInput={this.onInput}
              placeholder={this.placeholder}
            />
          </slot>
        </div>
        {this.hint && (
          <amplify-hint id={`${this.fieldId}-hint`}>{this.hint}</amplify-hint>
        )}
      </div>
    );
  }
}
