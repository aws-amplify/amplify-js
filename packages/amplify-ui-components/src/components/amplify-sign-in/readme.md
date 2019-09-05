# amplify-sign-in



<!-- Auto Generated Below -->


## Properties

| Property           | Attribute           | Description | Type                   | Default     |
| ------------------ | ------------------- | ----------- | ---------------------- | ----------- |
| `handleSubmit`     | --                  |             | `(Event: any) => void` | `undefined` |
| `overrideStyle`    | `override-style`    |             | `boolean`              | `false`     |
| `validationErrors` | `validation-errors` |             | `string`               | `undefined` |


## Dependencies

### Used by

 - [amplify-authenticator](../amplify-authenticator)

### Depends on

- [amplify-form-section](../amplify-form-section)
- [amplify-sign-in-username-field](../amplify-sign-in-username-field)
- [amplify-sign-in-password-field](../amplify-sign-in-password-field)
- [amplify-tooltip](../amplify-tooltip)
- [amplify-icon](../amplify-icon)

### Graph
```mermaid
graph TD;
  amplify-sign-in --> amplify-form-section
  amplify-sign-in --> amplify-sign-in-username-field
  amplify-sign-in --> amplify-sign-in-password-field
  amplify-sign-in --> amplify-tooltip
  amplify-sign-in --> amplify-icon
  amplify-form-section --> amplify-section
  amplify-form-section --> amplify-button
  amplify-sign-in-username-field --> amplify-form-field
  amplify-sign-in-username-field --> context-consumer
  amplify-form-field --> amplify-label
  amplify-form-field --> amplify-input
  amplify-form-field --> amplify-hint
  amplify-sign-in-password-field --> amplify-form-field
  amplify-sign-in-password-field --> context-consumer
  amplify-authenticator --> amplify-sign-in
  style amplify-sign-in fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
