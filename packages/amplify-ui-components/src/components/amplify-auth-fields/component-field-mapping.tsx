import { h } from '@stencil/core';
import { FormFieldType } from './amplify-auth-fields-interface';

const componentFieldMapping = {
  'username': (ff: FormFieldType) => (<amplify-username-field label={ff.label} placeholder={ff.placeholder} required={ff.required} />),
  'password': (ff: FormFieldType) => (<amplify-password-field label={ff.label} placeholder={ff.placeholder} hint={ff.hint} required={ff.required} />),
  'email': (ff: FormFieldType) => (<amplify-email-field label={ff.label} placeholder={ff.placeholder} required={ff.required} />),
  'code': (ff: FormFieldType) => (<amplify-code-field label={ff.label} placeholder={ff.placeholder} required={ff.required} />),
  'phone': (ff: FormFieldType) => (<amplify-form-field type="tel" label={ff.label} placeholder={ff.placeholder} required={ff.required} />),
};

export default componentFieldMapping;
