# amplify-verify-contact

<!-- Auto Generated Below -->


## Properties

| Property                | Attribute        | Description                                                                     | Type                                                | Default     |
| ----------------------- | ---------------- | ------------------------------------------------------------------------------- | --------------------------------------------------- | ----------- |
| `handleAuthStateChange` | --               | Passed from the Authenticator component in order to change Authentication state | `(nextAuthState: AuthState, data?: object) => void` | `undefined` |
| `overrideStyle`         | `override-style` | (Optional) Override default styling                                             | `boolean`                                           | `false`     |
| `user`                  | --               | Used for the username to be passed to resend code                               | `CognitoUserInterface`                              | `undefined` |


## Dependencies

### Used by

 - [amplify-authenticator](../amplify-authenticator)

### Depends on

- [amplify-input](../amplify-input)
- [amplify-radio-button](../amplify-radio-button)
- [amplify-form-section](../amplify-form-section)
- [amplify-link](../amplify-link)

### Graph
```mermaid
graph TD;
  amplify-verify-contact --> amplify-input
  amplify-verify-contact --> amplify-radio-button
  amplify-verify-contact --> amplify-form-section
  amplify-verify-contact --> amplify-link
  amplify-radio-button --> amplify-label
  amplify-form-section --> amplify-button
  amplify-form-section --> amplify-section
  amplify-authenticator --> amplify-verify-contact
  style amplify-verify-contact fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
