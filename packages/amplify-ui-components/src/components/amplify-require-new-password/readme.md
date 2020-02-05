# amplify-require-new-password

<!-- Auto Generated Below -->


## Properties

| Property                | Attribute            | Description                                                                     | Type                                                | Default                                                                                                                                                                                                                          |
| ----------------------- | -------------------- | ------------------------------------------------------------------------------- | --------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `formFields`            | --                   | The form fields displayed inside of the forgot password form                    | `FormFieldTypes`                                    | `[     {       type: AuthFormField.Password,       required: true,       handleInputChange: event => this.handlePasswordChange(event),       label: NEW_PASSWORD_LABEL,       placeholder: NEW_PASSWORD_PLACEHOLDER,     },   ]` |
| `handleAuthStateChange` | --                   | Passed from the Authenticator component in order to change Authentication state | `(nextAuthState: AuthState, data?: object) => void` | `undefined`                                                                                                                                                                                                                      |
| `handleSubmit`          | --                   | The function called when submitting a new password                              | `(event: Event) => void`                            | `event => this.completeNewPassword(event)`                                                                                                                                                                                       |
| `headerText`            | `header-text`        | The header text of the forgot password section                                  | `string`                                            | `CHANGE_PASSWORD`                                                                                                                                                                                                                |
| `overrideStyle`         | `override-style`     | (Optional) Overrides default styling                                            | `boolean`                                           | `false`                                                                                                                                                                                                                          |
| `submitButtonText`      | `submit-button-text` | The text displayed inside of the submit button for the form                     | `string`                                            | `CHANGE_PASSWORD_ACTION`                                                                                                                                                                                                         |
| `user`                  | --                   | Used for the username to be passed to resend code                               | `CognitoUserInterface`                              | `undefined`                                                                                                                                                                                                                      |


## Dependencies

### Used by

 - [amplify-authenticator](../amplify-authenticator)

### Depends on

- [amplify-form-section](../amplify-form-section)
- [amplify-link](../amplify-link)
- [amplify-auth-fields](../amplify-auth-fields)

### Graph
```mermaid
graph TD;
  amplify-require-new-password --> amplify-form-section
  amplify-require-new-password --> amplify-link
  amplify-require-new-password --> amplify-auth-fields
  amplify-form-section --> amplify-button
  amplify-form-section --> amplify-section
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
  amplify-authenticator --> amplify-require-new-password
  style amplify-require-new-password fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
