# amplify-authenticator



<!-- Auto Generated Below -->


## Properties

| Property  | Attribute | Description | Type       | Default     |
| --------- | --------- | ----------- | ---------- | ----------- |
| `content` | --        |             | `Function` | `undefined` |
| `signIn`  | --        |             | `Function` | `undefined` |


## Events

| Event             | Description | Type               |
| ----------------- | ----------- | ------------------ |
| `authStateChange` |             | `CustomEvent<any>` |


## Dependencies

### Depends on

- [amplify-sign-in](../amplify-sign-in)

### Graph
```mermaid
graph TD;
  amplify-authenticator --> amplify-sign-in
  amplify-sign-in --> amplify-section
  amplify-sign-in --> amplify-section-header
  amplify-sign-in --> amplify-sign-in-username-field
  amplify-sign-in --> amplify-sign-in-password-field
  amplify-sign-in --> amplify-button
  amplify-sign-in-username-field --> amplify-form-field
  amplify-form-field --> amplify-label
  amplify-form-field --> amplify-text-input
  amplify-form-field --> amplify-hint
  amplify-sign-in-password-field --> amplify-form-field
  style amplify-authenticator fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
