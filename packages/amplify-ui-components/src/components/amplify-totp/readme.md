# amplify-totp

<!-- Auto Generated Below -->


## Properties

| Property   | Attribute | Description                                                            | Type                   | Default     |
| ---------- | --------- | ---------------------------------------------------------------------- | ---------------------- | ----------- |
| `MFATypes` | --        | Types of MFA options                                                   | `MFATOTPOptions`       | `undefined` |
| `authData` | --        | Current authenticated user in order to sign requests properly for TOTP | `CognitoUserInterface` | `null`      |


## Dependencies

### Used by

 - [amplify-examples](../amplify-examples)

### Depends on

- [amplify-form-section](../amplify-form-section)
- [amplify-radio-button](../amplify-radio-button)

### Graph
```mermaid
graph TD;
  amplify-totp --> amplify-form-section
  amplify-totp --> amplify-radio-button
  amplify-form-section --> amplify-button
  amplify-form-section --> amplify-section
  amplify-radio-button --> amplify-label
  amplify-examples --> amplify-totp
  style amplify-totp fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
