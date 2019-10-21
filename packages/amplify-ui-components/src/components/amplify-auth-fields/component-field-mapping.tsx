import { h } from '@stencil/core';
import { FormFieldType } from './amplify-auth-fields-interface';

const componentFieldMapping = {
  username: (ff: FormFieldType) => (
    <amplify-username-field
      label={ff.label}
      placeholder={ff.placeholder}
      required={ff.required}
      handleInputChange={ff.handleInputChange}
      value={ff.value}
    />
  ),
  password: (ff: FormFieldType) => (
    <amplify-password-field
      label={ff.label}
      placeholder={ff.placeholder}
      hint={ff.hint}
      required={ff.required}
      handleInputChange={ff.handleInputChange}
      value={ff.value}
    />
  ),
  email: (ff: FormFieldType) => (
    <amplify-email-field
      label={ff.label}
      placeholder={ff.placeholder}
      required={ff.required}
      handleInputChange={ff.handleInputChange}
      value={ff.value}
    />
  ),
  code: (ff: FormFieldType) => (
    <amplify-code-field
      label={ff.label}
      placeholder={ff.placeholder}
      hint={ff.hint}
      required={ff.required}
      handleInputChange={ff.handleInputChange}
      value={ff.value}
    />
  ),
  // TODO: Will create a phone field component once the dial country code component is in
  phone: (ff: FormFieldType) => (
    <amplify-form-field
      type="tel"
      label={ff.label}
      placeholder={ff.placeholder}
      required={ff.required}
      handleInputChange={ff.handleInputChange}
      value={ff.value}
    />
  ),
  default: (ff: FormFieldType) => (
    <amplify-form-field
      label={ff.label}
      placeholder={ff.placeholder}
      required={ff.required}
      handleInputChange={ff.handleInputChange}
      value={ff.value}
    />
  ),
};

export default componentFieldMapping;
