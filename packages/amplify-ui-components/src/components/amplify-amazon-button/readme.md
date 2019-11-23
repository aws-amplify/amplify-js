# amplify-amazon-button

<!-- Auto Generated Below -->


## Properties

| Property                | Attribute        | Description                                                                                                                    | Type                                                | Default     |
| ----------------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------- | ----------- |
| `clientId`              | `client-id`      | App-specific client ID from Google                                                                                             | `string`                                            | `undefined` |
| `handleAuthStateChange` | --               | Passed from the Authenticator component in order to change Authentication state e.g. SignIn -> 'Create Account' link -> SignUp | `(nextAuthState: AuthState, data?: object) => void` | `undefined` |
| `overrideStyle`         | `override-style` | (Optional) Override default styling                                                                                            | `boolean`                                           | `false`     |


## Dependencies

### Used by

 - [amplify-federated-buttons](../amplify-federated-buttons)

### Depends on

- [amplify-sign-in-button](../amplify-sign-in-button)

### Graph
```mermaid
graph TD;
  amplify-amazon-button --> amplify-sign-in-button
  amplify-sign-in-button --> amplify-icon
  amplify-federated-buttons --> amplify-amazon-button
  style amplify-amazon-button fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
