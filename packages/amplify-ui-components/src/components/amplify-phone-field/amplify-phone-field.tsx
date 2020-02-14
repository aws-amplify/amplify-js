import { Component, Prop, FunctionalComponent, h } from '@stencil/core';
import { PHONE_SUFFIX, PHONE_LABEL, PHONE_PLACEHOLDER } from '../../common/constants';

@Component({
  tag: 'amplify-phone-field',
  styleUrl: 'amplify-phone-field.scss',
  shadow: true,
})
export class AmplifyPhoneField {
  /** Based on the type of field e.g. sign in, sign up, forgot password, etc. */
  @Prop() fieldId: string = PHONE_SUFFIX;
  /** Used for the Phone label */
  @Prop() label: string = PHONE_LABEL;
  /** Used for the placeholder label */
  @Prop() placeholder: string = PHONE_PLACEHOLDER;
  /** Used as the hint in case you forgot your confirmation code, etc. */
  @Prop() hint: string | FunctionalComponent | null;
  /** The required flag in order to make an input required prior to submitting a form */
  @Prop() required: boolean = false;
  /** The callback, called when the input is modified by the user. */
  @Prop() handleInputChange?: (inputEvent: Event) => void;
  /** The value of the content inside of the input field */
  @Prop() value: string;
  /** Attributes places on the input element: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#Attributes */
  @Prop() inputProps?: object;
  /** Will disable the input if set to true */
  @Prop() disabled?: boolean;

  render() {
    return (
      <div>
        <amplify-form-field label={this.label} type="tel" hint={this.hint} required={this.required}>
          <div class="phone-field" slot="input">
            <amplify-country-dial-code handleInputChange={this.handleInputChange} />
            <amplify-input
              fieldId={this.fieldId}
              handleInputChange={this.handleInputChange}
              placeholder={this.placeholder}
              name={this.fieldId}
              value={this.value}
              inputProps={this.inputProps}
              disabled={this.disabled}
            />
          </div>
        </amplify-form-field>
      </div>
    );
  }
}
