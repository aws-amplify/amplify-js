# sample-app

<!-- Auto Generated Below -->


## Dependencies

### Depends on

- [amplify-authenticator](../amplify-authenticator)
- [rock-paper-scissor](rock-paper-scissor)
- [rock-paper-scissor](rock-paper-scissor)
- [amplify-scene](../amplify-scene)

### Graph
```mermaid
graph TD;
  amplify-examples --> amplify-authenticator
  amplify-examples --> rock-paper-scissor
  amplify-examples --> rock-paper-scissor
  amplify-examples --> amplify-scene
  amplify-authenticator --> amplify-sign-in
  amplify-authenticator --> amplify-sign-up
  amplify-authenticator --> context-consumer
  amplify-sign-in --> amplify-form-section
  amplify-sign-in --> amplify-auth-fields
  amplify-sign-in --> amplify-link
  amplify-sign-in --> context-consumer
  amplify-sign-in --> amplify-link
  amplify-sign-in --> amplify-button
  amplify-form-section --> amplify-section
  amplify-form-section --> amplify-button
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
  rock-paper-scissor --> amplify-button
  amplify-scene --> amplify-icon-button
  amplify-scene --> amplify-scene-loading
  amplify-icon-button --> amplify-tooltip
  amplify-icon-button --> amplify-icon
  style amplify-examples fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
