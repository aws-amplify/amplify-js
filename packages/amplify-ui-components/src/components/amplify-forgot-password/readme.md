# amplify-forgot-password



<!-- Auto Generated Below -->


## Properties

| Property                | Attribute            | Description | Type                                                | Default                 |
| ----------------------- | -------------------- | ----------- | --------------------------------------------------- | ----------------------- |
| `formFields`            | --                   |             | `FormFieldTypes`                                    | `undefined`             |
| `handleAuthStateChange` | --                   |             | `(nextAuthState: AuthState, data?: object) => void` | `undefined`             |
| `headerText`            | `header-text`        |             | `string`                                            | `'Reset your password'` |
| `overrideStyle`         | `override-style`     |             | `boolean`                                           | `false`                 |
| `submitButtonText`      | `submit-button-text` |             | `string`                                            | `'Send Code'`           |


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
  amplify-forgot-password --> amplify-form-section
  amplify-forgot-password --> amplify-link
  amplify-forgot-password --> amplify-auth-fields
  amplify-form-section --> amplify-button
  amplify-form-section --> amplify-section
  amplify-auth-fields --> amplify-username-field
  amplify-auth-fields --> amplify-password-field
  amplify-auth-fields --> amplify-email-field
  amplify-auth-fields --> amplify-code-field
  amplify-auth-fields --> amplify-form-field
  amplify-auth-fields --> amplify-form-field
  amplify-username-field --> amplify-form-field
  amplify-form-field --> amplify-label
  amplify-form-field --> amplify-input
  amplify-form-field --> amplify-hint
  amplify-password-field --> amplify-form-field
  amplify-email-field --> amplify-form-field
  amplify-code-field --> amplify-form-field
  amplify-authenticator --> amplify-forgot-password
  style amplify-forgot-password fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
