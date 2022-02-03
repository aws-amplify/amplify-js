# amplify-federated-sign-in

<!-- Auto Generated Below -->


## Properties

| Property    | Attribute    | Description                            | Type                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | Default            |
| ----------- | ------------ | -------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ |
| `authState` | `auth-state` | The current authentication state.      | `AuthState.ConfirmSignIn \| AuthState.ConfirmSignUp \| AuthState.CustomConfirmSignIn \| AuthState.ForgotPassword \| AuthState.Loading \| AuthState.ResetPassword \| AuthState.SettingMFA \| AuthState.SignIn \| AuthState.SignOut \| AuthState.SignUp \| AuthState.SignedIn \| AuthState.SignedOut \| AuthState.SigningUp \| AuthState.TOTPSetup \| AuthState.VerifyContact \| AuthState.VerifyingAttributes \| AuthState.confirmingSignInCustomFlow \| AuthState.confirmingSignUpCustomFlow` | `AuthState.SignIn` |
| `federated` | `federated`  | Federated credentials & configuration. | `any`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | `{}`               |


## Dependencies

### Depends on

- [amplify-form-section](../amplify-form-section)
- [amplify-section](../amplify-section)
- [amplify-federated-buttons](../amplify-federated-buttons)

### Graph
```mermaid
graph TD;
  amplify-federated-sign-in --> amplify-form-section
  amplify-federated-sign-in --> amplify-section
  amplify-federated-sign-in --> amplify-federated-buttons
  amplify-form-section --> amplify-section
  amplify-form-section --> amplify-button
  amplify-form-section --> amplify-loading-spinner
  amplify-button --> amplify-icon
  amplify-loading-spinner --> amplify-icon
  amplify-federated-buttons --> amplify-google-button
  amplify-federated-buttons --> amplify-facebook-button
  amplify-federated-buttons --> amplify-amazon-button
  amplify-federated-buttons --> amplify-oauth-button
  amplify-federated-buttons --> amplify-auth0-button
  amplify-google-button --> amplify-sign-in-button
  amplify-sign-in-button --> amplify-icon
  amplify-facebook-button --> amplify-sign-in-button
  amplify-amazon-button --> amplify-sign-in-button
  amplify-oauth-button --> amplify-sign-in-button
  amplify-auth0-button --> amplify-sign-in-button
  style amplify-federated-sign-in fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
