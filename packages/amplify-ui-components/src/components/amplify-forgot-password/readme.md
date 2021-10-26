# amplify-forgot-password

<!-- Auto Generated Below -->


## Properties

| Property                | Attribute            | Description                                                                               | Type                                                | Default                            |
| ----------------------- | -------------------- | ----------------------------------------------------------------------------------------- | --------------------------------------------------- | ---------------------------------- |
| `formFields`            | --                   | The form fields displayed inside of the forgot password form                              | `FormFieldTypes \| string[]`                        | `[]`                               |
| `handleAuthStateChange` | --                   | Auth state change handler for this component                                              | `(nextAuthState: AuthState, data?: object) => void` | `dispatchAuthStateChangeEvent`     |
| `handleSend`            | --                   | The function called when making a request to reset password                               | `(event: Event) => void`                            | `event => this.send(event)`        |
| `handleSubmit`          | --                   | The function called when submitting a new password                                        | `(event: Event) => void`                            | `event => this.submit(event)`      |
| `headerText`            | `header-text`        | The header text of the forgot password section                                            | `string`                                            | `Translations.RESET_YOUR_PASSWORD` |
| `sendButtonText`        | `send-button-text`   | The text displayed inside of the send code button for the form                            | `string`                                            | `Translations.SEND_CODE`           |
| `submitButtonText`      | `submit-button-text` | The text displayed inside of the submit button for the form                               | `string`                                            | `Translations.SUBMIT`              |
| `usernameAlias`         | `username-alias`     | Username Alias is used to setup authentication with `username`, `email` or `phone_number` | `"email" \| "phone_number" \| "username"`           | `'username'`                       |


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
  amplify-forgot-password --> amplify-form-section
  amplify-forgot-password --> amplify-button
  amplify-forgot-password --> amplify-auth-fields
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
  amplify-authenticator --> amplify-forgot-password
  style amplify-forgot-password fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
