import { Component, Prop, h } from '@stencil/core';
import { FormFieldType } from './amplify-auth-fields-interface';
import componentFieldMapping from './component-field-mapping';

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
   * ```
   * [
   *  {
   *    type: 'username'|'password'|'email'|'code'|'default',
   *    label: string,
   *    placeholder: string,
   *    hint: string | Functional Component | null,
   *    required: boolean
   *  }
   * ]
   * ```
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
