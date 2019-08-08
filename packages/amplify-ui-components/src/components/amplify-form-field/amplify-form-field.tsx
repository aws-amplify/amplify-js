import { Component, Prop, h } from '@stencil/core';
import { TextFieldTypes } from '../../common/types';

@Component({
  tag: 'amplify-form-field',
  styleUrl: 'amplify-form-field.css',
})
export class AmplifyFormField {
  /** The ID of the field.  Should match with its corresponding input's ID. */
  @Prop() fieldId: string;
  /** The text of the label.  Goes above the input. Ex: "First name" */
  @Prop() label: string | null;
  /** The text of the description.  Goes between the label and the input. */
  @Prop() description: string | null;
  /** The text of a hint to the user as to how to fill out the input.  Goes just below the input. */
  @Prop() hint: string | null;
  /** The input type.  Can be any HTML input type. */
  @Prop() type?: TextFieldTypes = "text";
  /** The callback, called when the input is modified by the user. */
  @Prop() onInput?: (arg0: Event) => void;

  render() {
    return (
      <div>
        {this.label && (
          <label htmlFor={this.fieldId} class="label">
            {this.label}
          </label>
        )}
        {this.description && (
          <div id={`${this.fieldId}-description`} class="description">
            {this.description}
          </div>
        )}
        <div>
          <slot name="input">
            <amplify-input
              fieldId={this.fieldId}
              aria-describedby={this.fieldId && this.description ? `${this.fieldId}-description` : null}
              type={this.type}
              onInput={this.onInput}
            />
          </slot>
        </div>
        {this.hint && (
          <amplify-hint id={`${this.fieldId}-description`}>{this.hint}</amplify-hint>
        )}
      </div>
    );
  }
}
