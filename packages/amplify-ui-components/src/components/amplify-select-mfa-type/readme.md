# amplify-totp

<!-- Auto Generated Below -->


## Properties

| Property       | Attribute | Description                                                            | Type                     | Default                       |
| -------------- | --------- | ---------------------------------------------------------------------- | ------------------------ | ----------------------------- |
| `MFATypes`     | --        | Types of MFA options                                                   | `MFATypesInterface`      | `undefined`                   |
| `authData`     | --        | Current authenticated user in order to sign requests properly for TOTP | `CognitoUserInterface`   | `undefined`                   |
| `handleSubmit` | --        | Fires when Verify is clicked                                           | `(event: Event) => void` | `event => this.verify(event)` |


## Dependencies

### Depends on

- [amplify-form-section](../amplify-form-section)
- [amplify-radio-button](../amplify-radio-button)
- [amplify-toast](../amplify-toast)
- [amplify-totp-setup](../amplify-totp-setup)

### Graph
```mermaid
graph TD;
  amplify-select-mfa-type --> amplify-form-section
  amplify-select-mfa-type --> amplify-radio-button
  amplify-select-mfa-type --> amplify-toast
  amplify-select-mfa-type --> amplify-totp-setup
  amplify-form-section --> amplify-section
  amplify-form-section --> amplify-button
  amplify-form-section --> amplify-loading-spinner
  amplify-button --> amplify-icon
  amplify-loading-spinner --> amplify-icon
  amplify-radio-button --> amplify-label
  amplify-toast --> amplify-icon
  amplify-totp-setup --> amplify-form-section
  amplify-totp-setup --> amplify-form-field
  amplify-form-field --> amplify-label
  amplify-form-field --> amplify-input
  amplify-form-field --> amplify-hint
  style amplify-select-mfa-type fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
