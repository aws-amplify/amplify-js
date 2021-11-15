# amplify-sign-in

<!-- Auto Generated Below -->


## Properties

| Property                | Attribute            | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | Type                                                | Default                          |
| ----------------------- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- | -------------------------------- |
| `formFields`            | --                   | Form fields allows you to utilize our pre-built components such as username field, code field, password field, email field, etc. by passing an array of strings that you would like the order of the form to be in. If you need more customization, such as changing text for a label or adjust a placeholder, you can follow the structure below in order to do just that. ``` [   {     type: string,     label: string,     placeholder: string,     hint: string \| Functional Component \| null,     required: boolean   } ] ``` | `FormFieldTypes \| string[]`                        | `this.defaultFormFields`         |
| `handleAuthStateChange` | --                   | Auth state change handler for this component                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | `(nextAuthState: AuthState, data?: object) => void` | `dispatchAuthStateChangeEvent`   |
| `handleSubmit`          | --                   | Fires when confirm sign in form is submitted                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | `(event: Event) => void`                            | `(event) => this.confirm(event)` |
| `headerText`            | `header-text`        | Used for header text in confirm sign in component                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | `string`                                            | `Translations.CONFIRM_SMS_CODE`  |
| `submitButtonText`      | `submit-button-text` | Used for the submit button text in confirm sign in component                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | `string`                                            | `Translations.CONFIRM`           |
| `user`                  | --                   | Cognito user signing in                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | `CognitoUserInterface`                              | `undefined`                      |


## Dependencies

### Used by

 - [amplify-authenticator](../amplify-authenticator)

### Depends on

- [amplify-form-section](../amplify-form-section)
- [amplify-button](../amplify-button)
- [amplify-auth-fields](../amplify-auth-fields)

### Graph
```mermaid
graph TD;
  amplify-confirm-sign-in --> amplify-form-section
  amplify-confirm-sign-in --> amplify-button
  amplify-confirm-sign-in --> amplify-auth-fields
  amplify-form-section --> amplify-section
  amplify-form-section --> amplify-button
  amplify-form-section --> amplify-loading-spinner
  amplify-button --> amplify-icon
  amplify-loading-spinner --> amplify-icon
  amplify-auth-fields --> amplify-username-field
  amplify-auth-fields --> amplify-password-field
  amplify-auth-fields --> amplify-email-field
  amplify-auth-fields --> amplify-code-field
  amplify-auth-fields --> amplify-phone-field
  amplify-auth-fields --> amplify-form-field
  amplify-username-field --> amplify-form-field
  amplify-form-field --> amplify-label
  amplify-form-field --> amplify-input
  amplify-form-field --> amplify-hint
  amplify-password-field --> amplify-form-field
  amplify-email-field --> amplify-form-field
  amplify-code-field --> amplify-form-field
  amplify-phone-field --> amplify-form-field
  amplify-phone-field --> amplify-country-dial-code
  amplify-phone-field --> amplify-input
  amplify-country-dial-code --> amplify-select
  amplify-authenticator --> amplify-confirm-sign-in
  style amplify-confirm-sign-in fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
