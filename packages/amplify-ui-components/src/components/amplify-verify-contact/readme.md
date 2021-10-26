# amplify-verify-contact

<!-- Auto Generated Below -->


## Properties

| Property                | Attribute | Description                              | Type                                                | Default                        |
| ----------------------- | --------- | ---------------------------------------- | --------------------------------------------------- | ------------------------------ |
| `handleAuthStateChange` | --        | Authentication state handler             | `(nextAuthState: AuthState, data?: object) => void` | `dispatchAuthStateChangeEvent` |
| `user`                  | --        | User with unverified contact information | `CognitoUserInterface`                              | `undefined`                    |


## Dependencies

### Used by

 - [amplify-authenticator](../amplify-authenticator)

### Depends on

- [amplify-input](../amplify-input)
- [amplify-radio-button](../amplify-radio-button)
- [amplify-form-section](../amplify-form-section)
- [amplify-button](../amplify-button)

### Graph
```mermaid
graph TD;
  amplify-verify-contact --> amplify-input
  amplify-verify-contact --> amplify-radio-button
  amplify-verify-contact --> amplify-form-section
  amplify-verify-contact --> amplify-button
  amplify-radio-button --> amplify-label
  amplify-form-section --> amplify-section
  amplify-form-section --> amplify-button
  amplify-form-section --> amplify-loading-spinner
  amplify-button --> amplify-icon
  amplify-loading-spinner --> amplify-icon
  amplify-authenticator --> amplify-verify-contact
  style amplify-verify-contact fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
