# amplify-google-button

<!-- Auto Generated Below -->


## Properties

| Property                | Attribute   | Description                                                                                 | Type                                                | Default                        |
| ----------------------- | ----------- | ------------------------------------------------------------------------------------------- | --------------------------------------------------- | ------------------------------ |
| `clientId`              | `client-id` | App-specific client ID from Google                                                          | `string`                                            | `undefined`                    |
| `handleAuthStateChange` | --          | Auth state change handler for this component e.g. SignIn -> 'Create Account' link -> SignUp | `(nextAuthState: AuthState, data?: object) => void` | `dispatchAuthStateChangeEvent` |


## Dependencies

### Used by

 - [amplify-federated-buttons](../amplify-federated-buttons)

### Depends on

- [amplify-sign-in-button](../amplify-sign-in-button)

### Graph
```mermaid
graph TD;
  amplify-google-button --> amplify-sign-in-button
  amplify-sign-in-button --> amplify-icon
  amplify-federated-buttons --> amplify-google-button
  style amplify-google-button fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
