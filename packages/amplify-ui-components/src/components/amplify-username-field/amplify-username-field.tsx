import { Component, Prop, h } from '@stencil/core';
import { fieldIdTextTypes } from '../../common/types';
import { COMMON_USERNAME_TEXT } from '../../common/constants';

const {
  USERNAME_SUFFIX,
  USERNAME_LABEL,
  USERNAME_PLACEHOLDER,
} = COMMON_USERNAME_TEXT;

@Component({
  tag: 'amplify-username-field',
  shadow: false,
})
export class AmplifyUsernameField {
  /** Based on the type of field e.g. sign in, sign up, forgot password, etc. */
  @Prop() fieldIdText: fieldIdTextTypes;

  render() {
    return (
      <amplify-form-field fieldId={this.fieldIdText ? `${this.fieldIdText}-${USERNAME_SUFFIX}` : USERNAME_SUFFIX} label={USERNAME_LABEL} placeholder={USERNAME_PLACEHOLDER} />
    );
  }
}
