# amplify-authenticator



<!-- Auto Generated Below -->


## Properties

| Property           | Attribute            | Description                                                                                                                     | Type                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | Default            |
| ------------------ | -------------------- | ------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ |
| `initialAuthState` | `initial-auth-state` | Initial starting state of the Authenticator component. E.g. If `signup` is passed the default component is set to AmplifySignUp | `AuthState.ConfirmSignIn \| AuthState.ConfirmSignUp \| AuthState.CustomConfirmSignIn \| AuthState.ForgotPassword \| AuthState.Loading \| AuthState.ResetPassword \| AuthState.SettingMFA \| AuthState.SignIn \| AuthState.SignOut \| AuthState.SignUp \| AuthState.SignedIn \| AuthState.SigningUp \| AuthState.TOTPSetup \| AuthState.VerifyContact \| AuthState.VerifyingAttributes \| AuthState.confirmingSignInCustomFlow \| AuthState.confirmingSignUpCustomFlow \| AuthState.signedOut` | `AuthState.SignIn` |


## Dependencies

### Used by

 - [amplify-examples](../amplify-examples)

### Depends on

- [amplify-sign-in](../amplify-sign-in)
- [amplify-sign-up](../amplify-sign-up)
- [amplify-confirm-sign-up](../amplify-confirm-sign-up)
- [amplify-forgot-password](../amplify-forgot-password)
- context-consumer

### Graph
```mermaid
graph TD;
  amplify-authenticator --> amplify-sign-in
  amplify-authenticator --> amplify-sign-up
  amplify-authenticator --> amplify-confirm-sign-up
  amplify-authenticator --> amplify-forgot-password
  amplify-authenticator --> context-consumer
  amplify-sign-in --> amplify-link
  amplify-sign-in --> amplify-form-section
  amplify-sign-in --> amplify-auth-fields
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
  amplify-sign-up --> amplify-form-section
  amplify-sign-up --> amplify-auth-fields
  amplify-sign-up --> amplify-link
  amplify-sign-up --> amplify-button
  amplify-confirm-sign-up --> amplify-link
  amplify-confirm-sign-up --> amplify-form-section
  amplify-confirm-sign-up --> amplify-auth-fields
  amplify-confirm-sign-up --> amplify-link
  amplify-confirm-sign-up --> amplify-button
  amplify-forgot-password --> amplify-form-section
  amplify-forgot-password --> amplify-link
  amplify-forgot-password --> amplify-auth-fields
  amplify-examples --> amplify-authenticator
  style amplify-authenticator fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
