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
  amplify-sign-in --> amplify-section
  amplify-sign-in --> amplify-section-header
  amplify-sign-in --> amplify-sign-in-username-field
  amplify-sign-in --> amplify-sign-in-password-field
  amplify-sign-in --> amplify-button
  amplify-sign-in-username-field --> amplify-form-field
  amplify-sign-in-username-field --> context-consumer
  amplify-form-field --> amplify-label
  amplify-form-field --> amplify-input
  amplify-form-field --> amplify-hint
  amplify-sign-in-password-field --> amplify-form-field
  amplify-sign-in-password-field --> context-consumer
  amplify-examples --> amplify-authenticator
  style amplify-authenticator fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
