# amplify-facebook-button

<!-- Auto Generated Below -->

## Properties

| Property                | Attribute | Description                                                                                                                     | Type                                                | Default     |
| ----------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- | ----------- |
| `appId`                 | `app-id`  | App-specific client ID from Facebook                                                                                            | `string`                                            | `undefined` |
| `handleAuthStateChange` | --        | Passed from the Authenticatior component in order to change Authentication state e.g. SignIn -> 'Create Account' link -> SignUp | `(nextAuthState: AuthState, data?: object) => void` | `undefined` |

## Dependencies

### Used by

- [amplify-federated-buttons](../amplify-federated-buttons)

### Depends on

- [amplify-sign-in-button](../amplify-sign-in-button)

### Graph

```mermaid
graph TD;
  amplify-facebook-button --> amplify-sign-in-button
  amplify-federated-buttons --> amplify-facebook-button
  style amplify-facebook-button fill:#f9f,stroke:#333,stroke-width:4px
```

---

_Built with [StencilJS](https://stenciljs.com/)_
