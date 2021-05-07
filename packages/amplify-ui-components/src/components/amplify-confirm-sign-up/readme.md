# amplify-sign-up

<!-- Auto Generated Below -->


## Properties

| Property                | Attribute            | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | Type                                                | Default                                           |
| ----------------------- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- | ------------------------------------------------- |
| `formFields`            | --                   | Form fields allows you to utilize our pre-built components such as username field, code field, password field, email field, etc. by passing an array of strings that you would like the order of the form to be in. If you need more customization, such as changing text for a label or adjust a placeholder, you can follow the structure below in order to do just that. ``` [   {     type: string,     label: string,     placeholder: string,     hint: string \| Functional Component \| null,     required: boolean   } ] ``` | `FormFieldTypes \| string[]`                        | `[]`                                              |
| `handleAuthStateChange` | --                   | Auth state change handler for this components e.g. SignIn -> 'Create Account' link -> SignUp                                                                                                                                                                                                                                                                                                                                                                                                                                          | `(nextAuthState: AuthState, data?: object) => void` | `dispatchAuthStateChangeEvent`                    |
| `handleSubmit`          | --                   | Fires when sign up form is submitted                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | `(submitEvent: Event) => void`                      | `event => 		this.confirmSignUp(event)`            |
| `headerText`            | `header-text`        | Used for header text in confirm sign up component                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | `string`                                            | `Translations.CONFIRM_SIGN_UP_HEADER_TEXT`        |
| `submitButtonText`      | `submit-button-text` | Used for the submit button text in confirm sign up component                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | `string`                                            | `Translations.CONFIRM_SIGN_UP_SUBMIT_BUTTON_TEXT` |
| `user`                  | --                   | Used for the username to be passed to resend code                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | `CognitoUserInterface`                              | `undefined`                                       |
| `usernameAlias`         | `username-alias`     | Username Alias is used to setup authentication with `username`, `email` or `phone_number`                                                                                                                                                                                                                                                                                                                                                                                                                                             | `"email" \| "phone_number" \| "username"`           | `'username'`                                      |


## Dependencies

### Used by

 - [amplify-authenticator](../amplify-authenticator)

### Depends on

- [amplify-button](../amplify-button)
- [amplify-form-section](../amplify-form-section)
- [amplify-auth-fields](../amplify-auth-fields)

### Graph
```mermaid
graph TD;
  amplify-confirm-sign-up --> amplify-button
  amplify-confirm-sign-up --> amplify-form-section
  amplify-confirm-sign-up --> amplify-auth-fields
  amplify-button --> amplify-icon
  amplify-form-section --> amplify-section
  amplify-form-section --> amplify-button
  amplify-form-section --> amplify-loading-spinner
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
  amplify-authenticator --> amplify-confirm-sign-up
  style amplify-confirm-sign-up fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
