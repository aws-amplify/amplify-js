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

  render() {
    return (
      <amplify-form-field fieldId={this.fieldIdText ? `${this.fieldIdText}-${PASSWORD_SUFFIX}` : PASSWORD_SUFFIX} label={PASSWORD_LABEL} placeholder={PASSWORD_PLACEHOLDER} />
    );
  }
}
