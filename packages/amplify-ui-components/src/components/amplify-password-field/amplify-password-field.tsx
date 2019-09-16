import { Component, Prop, h } from '@stencil/core';
import { fieldIdTextTypes } from '../../common/types';
import { COMMON_PASSWORD_TEXT } from '../../common/constants';

const {
  PASSWORD_SUFFIX,
  PASSWORD_LABEL,
  PASSWORD_PLACEHOLDER,
  } = COMMON_PASSWORD_TEXT;
@Component({
  tag: 'amplify-password-field',
  shadow: false,
})
export class AmplifyPasswordField {
  /** Based on the type of field e.g. sign in, sign up, forgot password, etc. */
  @Prop() fieldIdText: fieldIdTextTypes;
  /** Used for the password label */
  @Prop() passwordLabel: string = PASSWORD_LABEL;
  /** Used for the placeholder label */
  @Prop() passwordPlaceholderLabel: string = PASSWORD_PLACEHOLDER;

  render() {
    return (
      <amplify-form-field fieldId={this.fieldIdText ? `${this.fieldIdText}-${PASSWORD_SUFFIX}` : PASSWORD_SUFFIX} label={this.passwordLabel} placeholder={this.passwordPlaceholderLabel} />
    );
  }
}
