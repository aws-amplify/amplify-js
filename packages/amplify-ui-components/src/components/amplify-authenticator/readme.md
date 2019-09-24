# amplify-authenticator



<!-- Auto Generated Below -->


## Properties

| Property   | Attribute  | Description | Type       | Default     |
| ---------- | ---------- | ----------- | ---------- | ----------- |
| `content`  | --         |             | `Function` | `undefined` |
| `override` | `override` |             | `boolean`  | `false`     |
| `signIn`   | --         |             | `Function` | `undefined` |


## Events

| Event             | Description | Type               |
| ----------------- | ----------- | ------------------ |
| `authStateChange` |             | `CustomEvent<any>` |


## Dependencies

### Used by

 - [amplify-examples](../amplify-examples)

### Depends on

- [amplify-sign-in](../amplify-sign-in)
- context-consumer

### Graph
```mermaid
graph TD;
  amplify-authenticator --> amplify-sign-in
  amplify-authenticator --> context-consumer
  amplify-sign-in --> amplify-form-section
  amplify-sign-in --> amplify-auth-fields
  amplify-sign-in --> amplify-link
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
  amplify-examples --> amplify-authenticator
  style amplify-authenticator fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
