# amplify-sign-in



<!-- Auto Generated Below -->


## Properties

| Property           | Attribute           | Description | Type                   | Default     |
| ------------------ | ------------------- | ----------- | ---------------------- | ----------- |
| `handleSubmit`     | --                  |             | `(Event: any) => void` | `undefined` |
| `validationErrors` | `validation-errors` |             | `string`               | `undefined` |


## Dependencies

### Used by

 - [amplify-authenticator](../amplify-authenticator)

### Depends on

- [amplify-section](../amplify-section)
- [amplify-section-header](../amplify-section-header)
- [amplify-sign-in-username-field](../amplify-sign-in-username-field)
- [amplify-sign-in-password-field](../amplify-sign-in-password-field)
- [amplify-button](../amplify-button)

### Graph
```mermaid
graph TD;
  amplify-sign-in --> amplify-section
  amplify-sign-in --> amplify-section-header
  amplify-sign-in --> amplify-sign-in-username-field
  amplify-sign-in --> amplify-sign-in-password-field
  amplify-sign-in --> amplify-button
  amplify-sign-in-username-field --> amplify-form-field
  amplify-sign-in-username-field --> context-consumer
  amplify-form-field --> amplify-input
  amplify-form-field --> amplify-hint
  amplify-sign-in-password-field --> amplify-form-field
  amplify-sign-in-password-field --> context-consumer
  amplify-authenticator --> amplify-sign-in
  style amplify-sign-in fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
