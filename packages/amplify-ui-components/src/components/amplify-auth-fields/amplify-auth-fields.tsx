import { Component, Prop, h } from '@stencil/core';
import { FormFieldType } from './amplify-auth-fields-interface';

const componentFieldMapping = {
  'username': (ff: FormFieldType) => (<amplify-username-field label={ff.label} placeholder={ff.placeholder} required={ff.required} />),
  'password': (ff: FormFieldType) => (<amplify-password-field label={ff.label} placeholder={ff.placeholder} hint={ff.hint} required={ff.required} />),
  'email': (ff: FormFieldType) => (<amplify-email-field label={ff.label} placeholder={ff.placeholder} required={ff.required} />),
  'code': (ff: FormFieldType) => (<amplify-code-field label={ff.label} placeholder={ff.placeholder} required={ff.required} />),
  'phone': (ff: FormFieldType) => (<amplify-form-field type="tel" label={ff.label} placeholder={ff.placeholder} required={ff.required} />),
};

const content = (formFields) => {
  let formComponentStructOptions = [];

  formFields.map((formField: FormFieldType | string) => {
    return formComponentStructOptions.push(componentFieldMapping[typeof formField === 'string' ? formField : formField.type](formField));    
  });
  
  return formComponentStructOptions;
};

@Component({
  tag: 'amplify-auth-fields',
  shadow: false,
})
export class AmplifyAuthFields {
  /** 
   * Form fields allows you to utilize our pre-built components such as username field, code field, password field, email field, etc.
   * by passing an array of strings that you would like the order of the form to be in. If you need more customization, such as changing
   * text for a label or adjust a placeholder, you can follow the structure below in order to do just that.
   * [
   *  {
   *    type: 'username'|'password'|'email'|'code'|'default',
   *    label: string,
   *    placeholder: string,
   *    hint: string | Functional Component | null,
   *    required: boolean
   *  }
   * ]
  */
  @Prop() formFields: object[] | string[];

  render() {
    return (
      <div>
        {content(this.formFields)}
      </div>
    );
  }
}
