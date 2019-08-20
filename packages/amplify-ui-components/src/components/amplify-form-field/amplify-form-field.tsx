import { Component, Prop, h } from '@stencil/core';
import { formField, formFieldLabel, formFieldDescription } from './amplify-form-field.style';
import { styleNuker } from '../../common/helpers';
import { TextFieldTypes } from '../../common/types';
import { AMPLIFY_UI_PREFIX } from '../../common/constants';

const staticFormFieldLabelClass = `${AMPLIFY_UI_PREFIX}--form-field-label`;
const staticFormFieldDescriptionClass = `${AMPLIFY_UI_PREFIX}--form-field-description`;
const staticFormFieldClass = `${AMPLIFY_UI_PREFIX}--form-field`;

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
  @Prop() onInputChange?: (inputEvent: Event) => void;
  /** (Optional) The placeholder for the input element.  Using hints is recommended, but placeholders can also be useful to convey information to users. */
  @Prop() placeholder?: string = '';
  /** (Optional) Override default styling */
  @Prop() override?: boolean = false;

  render() {
    return (
      <div class={styleNuker(this.override, staticFormFieldClass, formField)}>
        {this.label && (
          <div class={styleNuker(this.override, staticFormFieldLabelClass, formFieldLabel)}>
            <amplify-label htmlFor={this.fieldId} override={this.override}>
              {this.label}
            </amplify-label>
          </div>
        )}
        {this.description && (
          <div
            id={`${this.fieldId}-description`}
            class={styleNuker(this.override, staticFormFieldDescriptionClass, formFieldDescription)}
            data-test="form-field-description"
          >
            {this.description}
          </div>
        )}
        <div>
          <slot name='input'>
            <amplify-input
              fieldId={this.fieldId}
              description={this.description}
              type={this.type}
              onInputChange={this.onInputChange}
              placeholder={this.placeholder}
              override={this.override}
            />
          </slot>
        </div>
        {this.hint && (
          <amplify-hint id={`${this.fieldId}-hint`} override={this.override}>{this.hint}</amplify-hint>
        )}
      </div>
    );
  }
}
