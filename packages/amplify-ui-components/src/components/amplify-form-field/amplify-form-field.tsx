import { Component, Prop, h, FunctionalComponent } from '@stencil/core';
import { formField, formFieldLabel, formFieldDescription } from './amplify-form-field.style';
import { styleNuker } from '../../common/helpers';
import { TextFieldTypes } from '../../common/types/ui-types';
import { AMPLIFY_UI_PREFIX } from '../../common/constants';

const STATIC_FORM_FIELD_LABEL_CLASS_NAME = `${AMPLIFY_UI_PREFIX}--form-field-label`;
const STATIC_FORM_FIELD_DESCRIPTION_CLASS_NAME = `${AMPLIFY_UI_PREFIX}--form-field-description`;
const STATIC_FORM_FIELD_CLASS_NAME = `${AMPLIFY_UI_PREFIX}--form-field`;

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
  @Prop() hint: string | FunctionalComponent | null;
  /** The input type.  Can be any HTML input type. */
  @Prop() type?: TextFieldTypes = 'text';
  /** The required flag in order to make an input required prior to submitting a form */
  @Prop() required: boolean = false;
  /** The callback, called when the input is modified by the user. */
  @Prop() handleInputChange?: (inputEvent: Event) => void;
  /** (Optional) The placeholder for the input element.  Using hints is recommended, but placeholders can also be useful to convey information to users. */
  @Prop() placeholder?: string = '';
  /** (Optional) Override default styling */
  @Prop() overrideStyle?: boolean = false;
  /** (Optional) String value for the name of the input. */
  @Prop() name?: string;
  /** The value of the content inside of the input field */
  @Prop() value: string;
  /** Attributes places on the input element: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#Attributes */
  @Prop() inputProps?: object;
  /** Will disable the input if set to true */
  @Prop() disabled?: boolean;

  render() {
    return (
      <div class={styleNuker(this.overrideStyle, STATIC_FORM_FIELD_CLASS_NAME, formField)}>
        {this.label && (
          <div class={styleNuker(this.overrideStyle, STATIC_FORM_FIELD_LABEL_CLASS_NAME, formFieldLabel)}>
            <amplify-label htmlFor={this.fieldId} overrideStyle={this.overrideStyle}>
              {this.label}
            </amplify-label>
          </div>
        )}
        {this.description && (
          <div
            id={`${this.fieldId}-description`}
            class={styleNuker(this.overrideStyle, STATIC_FORM_FIELD_DESCRIPTION_CLASS_NAME, formFieldDescription)}
            data-test="form-field-description"
          >
            {this.description}
          </div>
        )}
        <div>
          <slot name="input">
            <amplify-input
              fieldId={this.fieldId}
              description={this.description}
              type={this.type}
              handleInputChange={this.handleInputChange}
              placeholder={this.placeholder}
              overrideStyle={this.overrideStyle}
              name={this.name}
              value={this.value}
              inputProps={this.inputProps}
              disabled={this.disabled}
            />
          </slot>
        </div>
        {this.hint && (
          <amplify-hint id={`${this.fieldId}-hint`} overrideStyle={this.overrideStyle}>
            {this.hint}
          </amplify-hint>
        )}
      </div>
    );
  }
}
