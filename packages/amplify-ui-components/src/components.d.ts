/* tslint:disable */
/**
 * This is an autogenerated file created by the Stencil compiler.
 * It contains typing information for all components that exist in this project.
 */


import { HTMLStencilElement, JSXBase } from '@stencil/core/internal';
import {
  FormFieldTypes,
} from './components/amplify-auth-fields/amplify-auth-fields-interface';
import {
  ButtonTypes,
  TextFieldTypes,
} from './common/types';
import {
  CountryCodeDialOptions,
} from './components/amplify-country-dial-code/amplify-country-dial-code-interface';
import {
  FunctionalComponent,
} from '@stencil/core';
import {
  IconNameType,
} from './components/amplify-icon/icons';
import {
  SelectOptionsNumber,
  SelectOptionsString,
} from './components/amplify-select/amplify-select-interface';

export namespace Components {
  interface AmplifyAuthFields {
    /**
    * Form fields allows you to utilize our pre-built components such as username field, code field, password field, email field, etc. by passing an array of strings that you would like the order of the form to be in. If you need more customization, such as changing text for a label or adjust a placeholder, you can follow the structure below in order to do just that. ``` [   {     type: 'username'|'password'|'email'|'code'|'default',     label: string,     placeholder: string,     hint: string | Functional Component | null,     required: boolean   } ] ```
    */
    'formFields': FormFieldTypes | string[];
  }
  interface AmplifyAuthenticator {
    'state': string;
  }
  interface AmplifyButton {
    /**
    * (Optional) Callback called when a user clicks on the button
    */
    'onButtonClick': (evt: Event) => void;
    /**
    * (Optional) Override default styling
    */
    'overrideStyle': boolean;
    /**
    * Type of the button: 'button', 'submit' or 'reset'
    */
    'type': ButtonTypes;
  }
  interface AmplifyCheckbox {
    /**
    * If `true`, the checkbox is selected.
    */
    'checked': boolean;
    /**
    * If `true`, the checkbox is disabled
    */
    'disabled': boolean;
    /**
    * Field ID used for the 'htmlFor' in the label
    */
    'fieldId': string;
    /**
    * Label for the checkbox
    */
    'label': string;
    /**
    * Name of the checkbox
    */
    'name'?: string;
    /**
    * (Optional) Overrides default styling
    */
    'overrideStyle': boolean;
    /**
    * Value of the checkbox
    */
    'value'?: string;
  }
  interface AmplifyCodeField {
    /**
    * Based on the type of field e.g. sign in, sign up, forgot password, etc.
    */
    'fieldId': string;
    /**
    * Used for the code label
    */
    'label': string;
    /**
    * Used for the placeholder label
    */
    'placeholder': string;
    /**
    * The required flag in order to make an input required prior to submitting a form
    */
    'required': boolean;
  }
  interface AmplifyCountryDialCode {
    /**
    * The options of the country dial code select input.
    */
    'options': CountryCodeDialOptions;
    /**
    * (Optional) Overrides default styling
    */
    'overrideStyle': boolean;
  }
  interface AmplifyEmailField {
    /**
    * Based on the type of field e.g. sign in, sign up, forgot password, etc.
    */
    'fieldId': string;
    /**
    * Used for the EMAIL label
    */
    'label': string;
    /**
    * Used for the placeholder label
    */
    'placeholder': string;
    /**
    * The required flag in order to make an input required prior to submitting a form
    */
    'required': boolean;
  }
  interface AmplifyExamples {}
  interface AmplifyFormField {
    /**
    * The text of the description.  Goes between the label and the input.
    */
    'description': string | null;
    /**
    * The ID of the field.  Should match with its corresponding input's ID.
    */
    'fieldId': string;
    /**
    * The text of a hint to the user as to how to fill out the input.  Goes just below the input.
    */
    'hint': string | FunctionalComponent | null;
    /**
    * The text of the label.  Goes above the input. Ex: 'First name'
    */
    'label': string | null;
    /**
    * The callback, called when the input is modified by the user.
    */
    'onInputChange'?: (inputEvent: Event) => void;
    /**
    * (Optional) Override default styling
    */
    'overrideStyle'?: boolean;
    /**
    * (Optional) The placeholder for the input element.  Using hints is recommended, but placeholders can also be useful to convey information to users.
    */
    'placeholder'?: string;
    /**
    * The required flag in order to make an input required prior to submitting a form
    */
    'required': boolean;
    /**
    * The input type.  Can be any HTML input type.
    */
    'type'?: TextFieldTypes;
  }
  interface AmplifyFormSection {
    /**
    * (Required) Function called upon submission of form
    */
    'handleSubmit': (inputEvent: Event) => void;
    /**
    * Used for form section header
    */
    'headerText': string;
    /**
    * (Optional) Overrides default styling
    */
    'overrideStyle'?: boolean;
    /**
    * (Optional) Used as a the default value within the default footer slot
    */
    'submitButtonText'?: string;
  }
  interface AmplifyHint {
    /**
    * (Optional) Override default styling
    */
    'overrideStyle': boolean;
  }
  interface AmplifyIcon {
    /**
    * (Required) Name of icon used to determine the icon rendered
    */
    'name': IconNameType;
    /**
    * (Optional) Override default styling
    */
    'overrideStyle': boolean;
  }
  interface AmplifyInput {
    /**
    * The text of the description.  Goes just below the label.
    */
    'description': string | null;
    /**
    * The ID of the field.  Should match with its corresponding input's ID.
    */
    'fieldId': string;
    /**
    * The callback, called when the input is modified by the user.
    */
    'onInputChange'?: (inputEvent: Event) => void;
    /**
    * (Optional) Override default styling
    */
    'overrideStyle': boolean;
    /**
    * (Optional) The placeholder for the input element.  Using hints is recommended, but placeholders can also be useful to convey information to users.
    */
    'placeholder'?: string;
    /**
    * The input type.  Can be any HTML input type.
    */
    'type'?: TextFieldTypes;
  }
  interface AmplifyLabel {
    'htmlFor': string;
    'overrideStyle': boolean;
  }
  interface AmplifyLink {
    'overrideStyle': boolean;
    'role': string;
  }
  interface AmplifyPasswordField {
    /**
    * Based on the type of field e.g. sign in, sign up, forgot password, etc.
    */
    'fieldId': string;
    /**
    * Used as the hint in case you forgot your password, etc.
    */
    'hint': string | FunctionalComponent | null;
    /**
    * Used for the password label
    */
    'label': string;
    /**
    * Used for the placeholder label
    */
    'placeholder': string;
    /**
    * The required flag in order to make an input required prior to submitting a form
    */
    'required': boolean;
  }
  interface AmplifyRadioButton {
    /**
    * If `true`, the radio button is selected.
    */
    'checked': boolean;
    /**
    * If `true`, the checkbox is disabled
    */
    'disabled': boolean;
    /**
    * Field ID used for the 'for' in the label
    */
    'fieldId': string;
    /**
    * Label for the radio button
    */
    'label': string;
    /**
    * (Optional) Name of radio button
    */
    'name'?: string;
    /**
    * (Optional) Overrides default styling
    */
    'overrideStyle': boolean;
    /**
    * (Optional) Value of radio button
    */
    'value'?: string;
  }
  interface AmplifySceneLoading {
    'loadPercentage': number;
    'sceneError': object;
    'sceneName': string;
  }
  interface AmplifySection {
    'overrideStyle'?: boolean;
    'role': string;
  }
  interface AmplifySelect {
    /**
    * Used for id field
    */
    'fieldId': string;
    /**
    * The options of the select input. Must be an Array of Objects with an Object shape of {label: string, value: string|number}
    */
    'options': SelectOptionsString | SelectOptionsNumber;
    /**
    * (Optional) Overrides default styling
    */
    'overrideStyle': boolean;
  }
  interface AmplifySignIn {
    /**
    * Form fields allows you to utilize our pre-built components such as username field, code field, password field, email field, etc. by passing an array of strings that you would like the order of the form to be in. If you need more customization, such as changing text for a label or adjust a placeholder, you can follow the structure below in order to do just that. ``` [   {     type: 'username'|'password'|'email'|'code'|'default',     label: string,     placeholder: string,     hint: string | Functional Component | null,     required: boolean   } ] ```
    */
    'formFields': FormFieldTypes | string[];
    /**
    * Fires when sign in form is submitted
    */
    'handleSubmit': (Event) => void;
    /**
    * Used for header text in sign in component
    */
    'headerText': string;
    /**
    * (Optional) Overrides default styling
    */
    'overrideStyle': boolean;
    /**
    * Used for the submit button text in sign in component
    */
    'submitButtonText': string;
    /**
    * Engages when invalid actions occur, such as missing field, etc.
    */
    'validationErrors': string;
  }
  interface AmplifyTooltip {
    /**
    * (Optional) Override default styling
    */
    'overrideStyle': boolean;
    /**
    * (Optional) Whether or not the tooltip should be automatically shown, i.e. not disappear when not hovered
    */
    'shouldAutoShow': boolean;
    /**
    * (Required) The text in the tooltip
    */
    'text': string;
  }
  interface AmplifyUsernameField {
    /**
    * Based on the type of field e.g. sign in, sign up, forgot password, etc.
    */
    'fieldId': string;
    /**
    * Used for the username label
    */
    'label': string;
    /**
    * Used for the placeholder label
    */
    'placeholder': string;
    /**
    * The required flag in order to make an input required prior to submitting a form
    */
    'required': boolean;
  }
  interface RockPaperScissor {
    'icon': Function;
  }
}

declare global {


  interface HTMLAmplifyAuthFieldsElement extends Components.AmplifyAuthFields, HTMLStencilElement {}
  var HTMLAmplifyAuthFieldsElement: {
    prototype: HTMLAmplifyAuthFieldsElement;
    new (): HTMLAmplifyAuthFieldsElement;
  };

  interface HTMLAmplifyAuthenticatorElement extends Components.AmplifyAuthenticator, HTMLStencilElement {}
  var HTMLAmplifyAuthenticatorElement: {
    prototype: HTMLAmplifyAuthenticatorElement;
    new (): HTMLAmplifyAuthenticatorElement;
  };

  interface HTMLAmplifyButtonElement extends Components.AmplifyButton, HTMLStencilElement {}
  var HTMLAmplifyButtonElement: {
    prototype: HTMLAmplifyButtonElement;
    new (): HTMLAmplifyButtonElement;
  };

  interface HTMLAmplifyCheckboxElement extends Components.AmplifyCheckbox, HTMLStencilElement {}
  var HTMLAmplifyCheckboxElement: {
    prototype: HTMLAmplifyCheckboxElement;
    new (): HTMLAmplifyCheckboxElement;
  };

  interface HTMLAmplifyCodeFieldElement extends Components.AmplifyCodeField, HTMLStencilElement {}
  var HTMLAmplifyCodeFieldElement: {
    prototype: HTMLAmplifyCodeFieldElement;
    new (): HTMLAmplifyCodeFieldElement;
  };

  interface HTMLAmplifyCountryDialCodeElement extends Components.AmplifyCountryDialCode, HTMLStencilElement {}
  var HTMLAmplifyCountryDialCodeElement: {
    prototype: HTMLAmplifyCountryDialCodeElement;
    new (): HTMLAmplifyCountryDialCodeElement;
  };

  interface HTMLAmplifyEmailFieldElement extends Components.AmplifyEmailField, HTMLStencilElement {}
  var HTMLAmplifyEmailFieldElement: {
    prototype: HTMLAmplifyEmailFieldElement;
    new (): HTMLAmplifyEmailFieldElement;
  };

  interface HTMLAmplifyExamplesElement extends Components.AmplifyExamples, HTMLStencilElement {}
  var HTMLAmplifyExamplesElement: {
    prototype: HTMLAmplifyExamplesElement;
    new (): HTMLAmplifyExamplesElement;
  };

  interface HTMLAmplifyFormFieldElement extends Components.AmplifyFormField, HTMLStencilElement {}
  var HTMLAmplifyFormFieldElement: {
    prototype: HTMLAmplifyFormFieldElement;
    new (): HTMLAmplifyFormFieldElement;
  };

  interface HTMLAmplifyFormSectionElement extends Components.AmplifyFormSection, HTMLStencilElement {}
  var HTMLAmplifyFormSectionElement: {
    prototype: HTMLAmplifyFormSectionElement;
    new (): HTMLAmplifyFormSectionElement;
  };

  interface HTMLAmplifyHintElement extends Components.AmplifyHint, HTMLStencilElement {}
  var HTMLAmplifyHintElement: {
    prototype: HTMLAmplifyHintElement;
    new (): HTMLAmplifyHintElement;
  };

  interface HTMLAmplifyIconElement extends Components.AmplifyIcon, HTMLStencilElement {}
  var HTMLAmplifyIconElement: {
    prototype: HTMLAmplifyIconElement;
    new (): HTMLAmplifyIconElement;
  };

  interface HTMLAmplifyInputElement extends Components.AmplifyInput, HTMLStencilElement {}
  var HTMLAmplifyInputElement: {
    prototype: HTMLAmplifyInputElement;
    new (): HTMLAmplifyInputElement;
  };

  interface HTMLAmplifyLabelElement extends Components.AmplifyLabel, HTMLStencilElement {}
  var HTMLAmplifyLabelElement: {
    prototype: HTMLAmplifyLabelElement;
    new (): HTMLAmplifyLabelElement;
  };

  interface HTMLAmplifyLinkElement extends Components.AmplifyLink, HTMLStencilElement {}
  var HTMLAmplifyLinkElement: {
    prototype: HTMLAmplifyLinkElement;
    new (): HTMLAmplifyLinkElement;
  };

  interface HTMLAmplifyPasswordFieldElement extends Components.AmplifyPasswordField, HTMLStencilElement {}
  var HTMLAmplifyPasswordFieldElement: {
    prototype: HTMLAmplifyPasswordFieldElement;
    new (): HTMLAmplifyPasswordFieldElement;
  };

  interface HTMLAmplifyRadioButtonElement extends Components.AmplifyRadioButton, HTMLStencilElement {}
  var HTMLAmplifyRadioButtonElement: {
    prototype: HTMLAmplifyRadioButtonElement;
    new (): HTMLAmplifyRadioButtonElement;
  };

  interface HTMLAmplifySceneLoadingElement extends Components.AmplifySceneLoading, HTMLStencilElement {}
  var HTMLAmplifySceneLoadingElement: {
    prototype: HTMLAmplifySceneLoadingElement;
    new (): HTMLAmplifySceneLoadingElement;
  };

  interface HTMLAmplifySectionElement extends Components.AmplifySection, HTMLStencilElement {}
  var HTMLAmplifySectionElement: {
    prototype: HTMLAmplifySectionElement;
    new (): HTMLAmplifySectionElement;
  };

  interface HTMLAmplifySelectElement extends Components.AmplifySelect, HTMLStencilElement {}
  var HTMLAmplifySelectElement: {
    prototype: HTMLAmplifySelectElement;
    new (): HTMLAmplifySelectElement;
  };

  interface HTMLAmplifySignInElement extends Components.AmplifySignIn, HTMLStencilElement {}
  var HTMLAmplifySignInElement: {
    prototype: HTMLAmplifySignInElement;
    new (): HTMLAmplifySignInElement;
  };

  interface HTMLAmplifyTooltipElement extends Components.AmplifyTooltip, HTMLStencilElement {}
  var HTMLAmplifyTooltipElement: {
    prototype: HTMLAmplifyTooltipElement;
    new (): HTMLAmplifyTooltipElement;
  };

  interface HTMLAmplifyUsernameFieldElement extends Components.AmplifyUsernameField, HTMLStencilElement {}
  var HTMLAmplifyUsernameFieldElement: {
    prototype: HTMLAmplifyUsernameFieldElement;
    new (): HTMLAmplifyUsernameFieldElement;
  };

  interface HTMLRockPaperScissorElement extends Components.RockPaperScissor, HTMLStencilElement {}
  var HTMLRockPaperScissorElement: {
    prototype: HTMLRockPaperScissorElement;
    new (): HTMLRockPaperScissorElement;
  };
  interface HTMLElementTagNameMap {
    'amplify-auth-fields': HTMLAmplifyAuthFieldsElement;
    'amplify-authenticator': HTMLAmplifyAuthenticatorElement;
    'amplify-button': HTMLAmplifyButtonElement;
    'amplify-checkbox': HTMLAmplifyCheckboxElement;
    'amplify-code-field': HTMLAmplifyCodeFieldElement;
    'amplify-country-dial-code': HTMLAmplifyCountryDialCodeElement;
    'amplify-email-field': HTMLAmplifyEmailFieldElement;
    'amplify-examples': HTMLAmplifyExamplesElement;
    'amplify-form-field': HTMLAmplifyFormFieldElement;
    'amplify-form-section': HTMLAmplifyFormSectionElement;
    'amplify-hint': HTMLAmplifyHintElement;
    'amplify-icon': HTMLAmplifyIconElement;
    'amplify-input': HTMLAmplifyInputElement;
    'amplify-label': HTMLAmplifyLabelElement;
    'amplify-link': HTMLAmplifyLinkElement;
    'amplify-password-field': HTMLAmplifyPasswordFieldElement;
    'amplify-radio-button': HTMLAmplifyRadioButtonElement;
    'amplify-scene-loading': HTMLAmplifySceneLoadingElement;
    'amplify-section': HTMLAmplifySectionElement;
    'amplify-select': HTMLAmplifySelectElement;
    'amplify-sign-in': HTMLAmplifySignInElement;
    'amplify-tooltip': HTMLAmplifyTooltipElement;
    'amplify-username-field': HTMLAmplifyUsernameFieldElement;
    'rock-paper-scissor': HTMLRockPaperScissorElement;
  }
}

declare namespace LocalJSX {
  interface AmplifyAuthFields extends JSXBase.HTMLAttributes<HTMLAmplifyAuthFieldsElement> {
    /**
    * Form fields allows you to utilize our pre-built components such as username field, code field, password field, email field, etc. by passing an array of strings that you would like the order of the form to be in. If you need more customization, such as changing text for a label or adjust a placeholder, you can follow the structure below in order to do just that. ``` [   {     type: 'username'|'password'|'email'|'code'|'default',     label: string,     placeholder: string,     hint: string | Functional Component | null,     required: boolean   } ] ```
    */
    'formFields'?: FormFieldTypes | string[];
  }
  interface AmplifyAuthenticator extends JSXBase.HTMLAttributes<HTMLAmplifyAuthenticatorElement> {
    'state'?: string;
  }
  interface AmplifyButton extends JSXBase.HTMLAttributes<HTMLAmplifyButtonElement> {
    /**
    * (Optional) Callback called when a user clicks on the button
    */
    'onButtonClick'?: (evt: Event) => void;
    /**
    * (Optional) Override default styling
    */
    'overrideStyle'?: boolean;
    /**
    * Type of the button: 'button', 'submit' or 'reset'
    */
    'type'?: ButtonTypes;
  }
  interface AmplifyCheckbox extends JSXBase.HTMLAttributes<HTMLAmplifyCheckboxElement> {
    /**
    * If `true`, the checkbox is selected.
    */
    'checked'?: boolean;
    /**
    * If `true`, the checkbox is disabled
    */
    'disabled'?: boolean;
    /**
    * Field ID used for the 'htmlFor' in the label
    */
    'fieldId'?: string;
    /**
    * Label for the checkbox
    */
    'label'?: string;
    /**
    * Name of the checkbox
    */
    'name'?: string;
    /**
    * (Optional) Overrides default styling
    */
    'overrideStyle'?: boolean;
    /**
    * Value of the checkbox
    */
    'value'?: string;
  }
  interface AmplifyCodeField extends JSXBase.HTMLAttributes<HTMLAmplifyCodeFieldElement> {
    /**
    * Based on the type of field e.g. sign in, sign up, forgot password, etc.
    */
    'fieldId'?: string;
    /**
    * Used for the code label
    */
    'label'?: string;
    /**
    * Used for the placeholder label
    */
    'placeholder'?: string;
    /**
    * The required flag in order to make an input required prior to submitting a form
    */
    'required'?: boolean;
  }
  interface AmplifyCountryDialCode extends JSXBase.HTMLAttributes<HTMLAmplifyCountryDialCodeElement> {
    /**
    * The options of the country dial code select input.
    */
    'options'?: CountryCodeDialOptions;
    /**
    * (Optional) Overrides default styling
    */
    'overrideStyle'?: boolean;
  }
  interface AmplifyEmailField extends JSXBase.HTMLAttributes<HTMLAmplifyEmailFieldElement> {
    /**
    * Based on the type of field e.g. sign in, sign up, forgot password, etc.
    */
    'fieldId'?: string;
    /**
    * Used for the EMAIL label
    */
    'label'?: string;
    /**
    * Used for the placeholder label
    */
    'placeholder'?: string;
    /**
    * The required flag in order to make an input required prior to submitting a form
    */
    'required'?: boolean;
  }
  interface AmplifyExamples extends JSXBase.HTMLAttributes<HTMLAmplifyExamplesElement> {}
  interface AmplifyFormField extends JSXBase.HTMLAttributes<HTMLAmplifyFormFieldElement> {
    /**
    * The text of the description.  Goes between the label and the input.
    */
    'description'?: string | null;
    /**
    * The ID of the field.  Should match with its corresponding input's ID.
    */
    'fieldId'?: string;
    /**
    * The text of a hint to the user as to how to fill out the input.  Goes just below the input.
    */
    'hint'?: string | FunctionalComponent | null;
    /**
    * The text of the label.  Goes above the input. Ex: 'First name'
    */
    'label'?: string | null;
    /**
    * The callback, called when the input is modified by the user.
    */
    'onInputChange'?: (inputEvent: Event) => void;
    /**
    * (Optional) Override default styling
    */
    'overrideStyle'?: boolean;
    /**
    * (Optional) The placeholder for the input element.  Using hints is recommended, but placeholders can also be useful to convey information to users.
    */
    'placeholder'?: string;
    /**
    * The required flag in order to make an input required prior to submitting a form
    */
    'required'?: boolean;
    /**
    * The input type.  Can be any HTML input type.
    */
    'type'?: TextFieldTypes;
  }
  interface AmplifyFormSection extends JSXBase.HTMLAttributes<HTMLAmplifyFormSectionElement> {
    /**
    * (Required) Function called upon submission of form
    */
    'handleSubmit'?: (inputEvent: Event) => void;
    /**
    * Used for form section header
    */
    'headerText'?: string;
    /**
    * (Optional) Overrides default styling
    */
    'overrideStyle'?: boolean;
    /**
    * (Optional) Used as a the default value within the default footer slot
    */
    'submitButtonText'?: string;
  }
  interface AmplifyHint extends JSXBase.HTMLAttributes<HTMLAmplifyHintElement> {
    /**
    * (Optional) Override default styling
    */
    'overrideStyle'?: boolean;
  }
  interface AmplifyIcon extends JSXBase.HTMLAttributes<HTMLAmplifyIconElement> {
    /**
    * (Required) Name of icon used to determine the icon rendered
    */
    'name'?: IconNameType;
    /**
    * (Optional) Override default styling
    */
    'overrideStyle'?: boolean;
  }
  interface AmplifyInput extends JSXBase.HTMLAttributes<HTMLAmplifyInputElement> {
    /**
    * The text of the description.  Goes just below the label.
    */
    'description'?: string | null;
    /**
    * The ID of the field.  Should match with its corresponding input's ID.
    */
    'fieldId'?: string;
    /**
    * The callback, called when the input is modified by the user.
    */
    'onInputChange'?: (inputEvent: Event) => void;
    /**
    * (Optional) Override default styling
    */
    'overrideStyle'?: boolean;
    /**
    * (Optional) The placeholder for the input element.  Using hints is recommended, but placeholders can also be useful to convey information to users.
    */
    'placeholder'?: string;
    /**
    * The input type.  Can be any HTML input type.
    */
    'type'?: TextFieldTypes;
  }
  interface AmplifyLabel extends JSXBase.HTMLAttributes<HTMLAmplifyLabelElement> {
    'htmlFor'?: string;
    'overrideStyle'?: boolean;
  }
  interface AmplifyLink extends JSXBase.HTMLAttributes<HTMLAmplifyLinkElement> {
    'overrideStyle'?: boolean;
    'role'?: string;
  }
  interface AmplifyPasswordField extends JSXBase.HTMLAttributes<HTMLAmplifyPasswordFieldElement> {
    /**
    * Based on the type of field e.g. sign in, sign up, forgot password, etc.
    */
    'fieldId'?: string;
    /**
    * Used as the hint in case you forgot your password, etc.
    */
    'hint'?: string | FunctionalComponent | null;
    /**
    * Used for the password label
    */
    'label'?: string;
    /**
    * Used for the placeholder label
    */
    'placeholder'?: string;
    /**
    * The required flag in order to make an input required prior to submitting a form
    */
    'required'?: boolean;
  }
  interface AmplifyRadioButton extends JSXBase.HTMLAttributes<HTMLAmplifyRadioButtonElement> {
    /**
    * If `true`, the radio button is selected.
    */
    'checked'?: boolean;
    /**
    * If `true`, the checkbox is disabled
    */
    'disabled'?: boolean;
    /**
    * Field ID used for the 'for' in the label
    */
    'fieldId'?: string;
    /**
    * Label for the radio button
    */
    'label'?: string;
    /**
    * (Optional) Name of radio button
    */
    'name'?: string;
    /**
    * (Optional) Overrides default styling
    */
    'overrideStyle'?: boolean;
    /**
    * (Optional) Value of radio button
    */
    'value'?: string;
  }
  interface AmplifySceneLoading extends JSXBase.HTMLAttributes<HTMLAmplifySceneLoadingElement> {
    'loadPercentage'?: number;
    'sceneError'?: object;
    'sceneName'?: string;
  }
  interface AmplifySection extends JSXBase.HTMLAttributes<HTMLAmplifySectionElement> {
    'overrideStyle'?: boolean;
    'role'?: string;
  }
  interface AmplifySelect extends JSXBase.HTMLAttributes<HTMLAmplifySelectElement> {
    /**
    * Used for id field
    */
    'fieldId'?: string;
    /**
    * The options of the select input. Must be an Array of Objects with an Object shape of {label: string, value: string|number}
    */
    'options'?: SelectOptionsString | SelectOptionsNumber;
    /**
    * (Optional) Overrides default styling
    */
    'overrideStyle'?: boolean;
  }
  interface AmplifySignIn extends JSXBase.HTMLAttributes<HTMLAmplifySignInElement> {
    /**
    * Form fields allows you to utilize our pre-built components such as username field, code field, password field, email field, etc. by passing an array of strings that you would like the order of the form to be in. If you need more customization, such as changing text for a label or adjust a placeholder, you can follow the structure below in order to do just that. ``` [   {     type: 'username'|'password'|'email'|'code'|'default',     label: string,     placeholder: string,     hint: string | Functional Component | null,     required: boolean   } ] ```
    */
    'formFields'?: FormFieldTypes | string[];
    /**
    * Fires when sign in form is submitted
    */
    'handleSubmit'?: (Event) => void;
    /**
    * Used for header text in sign in component
    */
    'headerText'?: string;
    /**
    * (Optional) Overrides default styling
    */
    'overrideStyle'?: boolean;
    /**
    * Used for the submit button text in sign in component
    */
    'submitButtonText'?: string;
    /**
    * Engages when invalid actions occur, such as missing field, etc.
    */
    'validationErrors'?: string;
  }
  interface AmplifyTooltip extends JSXBase.HTMLAttributes<HTMLAmplifyTooltipElement> {
    /**
    * (Optional) Override default styling
    */
    'overrideStyle'?: boolean;
    /**
    * (Optional) Whether or not the tooltip should be automatically shown, i.e. not disappear when not hovered
    */
    'shouldAutoShow'?: boolean;
    /**
    * (Required) The text in the tooltip
    */
    'text'?: string;
  }
  interface AmplifyUsernameField extends JSXBase.HTMLAttributes<HTMLAmplifyUsernameFieldElement> {
    /**
    * Based on the type of field e.g. sign in, sign up, forgot password, etc.
    */
    'fieldId'?: string;
    /**
    * Used for the username label
    */
    'label'?: string;
    /**
    * Used for the placeholder label
    */
    'placeholder'?: string;
    /**
    * The required flag in order to make an input required prior to submitting a form
    */
    'required'?: boolean;
  }
  interface RockPaperScissor extends JSXBase.HTMLAttributes<HTMLRockPaperScissorElement> {
    'icon'?: Function;
    'onIconChange'?: (event: CustomEvent<any>) => void;
  }

  interface IntrinsicElements {
    'amplify-auth-fields': AmplifyAuthFields;
    'amplify-authenticator': AmplifyAuthenticator;
    'amplify-button': AmplifyButton;
    'amplify-checkbox': AmplifyCheckbox;
    'amplify-code-field': AmplifyCodeField;
    'amplify-country-dial-code': AmplifyCountryDialCode;
    'amplify-email-field': AmplifyEmailField;
    'amplify-examples': AmplifyExamples;
    'amplify-form-field': AmplifyFormField;
    'amplify-form-section': AmplifyFormSection;
    'amplify-hint': AmplifyHint;
    'amplify-icon': AmplifyIcon;
    'amplify-input': AmplifyInput;
    'amplify-label': AmplifyLabel;
    'amplify-link': AmplifyLink;
    'amplify-password-field': AmplifyPasswordField;
    'amplify-radio-button': AmplifyRadioButton;
    'amplify-scene-loading': AmplifySceneLoading;
    'amplify-section': AmplifySection;
    'amplify-select': AmplifySelect;
    'amplify-sign-in': AmplifySignIn;
    'amplify-tooltip': AmplifyTooltip;
    'amplify-username-field': AmplifyUsernameField;
    'rock-paper-scissor': RockPaperScissor;
  }
}

export { LocalJSX as JSX };


declare module "@stencil/core" {
  export namespace JSX {
    interface IntrinsicElements extends LocalJSX.IntrinsicElements {}
  }
}


