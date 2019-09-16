# amplify-sign-in



<!-- Auto Generated Below -->


## Properties

| Property           | Attribute           | Description | Type                   | Default     |
| ------------------ | ------------------- | ----------- | ---------------------- | ----------- |
| `handleSubmit`     | --                  |             | `(Event: any) => void` | `undefined` |
| `overrideStyle`    | `override-style`    |             | `boolean`              | `false`     |
| `validationErrors` | `validation-errors` |             | `boolean`              | `false`     |


## Dependencies

### Used by

 - [amplify-examples](../amplify-examples)

### Depends on

- [amplify-form-section](../amplify-form-section)
- [amplify-form-field](../amplify-form-field)
- [amplify-link](../amplify-link)
- [amplify-link](../amplify-link)
- [amplify-button](../amplify-button)

### Graph
```mermaid
graph TD;
  amplify-sign-in --> amplify-form-section
  amplify-sign-in --> amplify-form-field
  amplify-sign-in --> amplify-link
  amplify-sign-in --> amplify-link
  amplify-sign-in --> amplify-button
  amplify-form-section --> amplify-section
  amplify-form-section --> amplify-button
  amplify-form-field --> amplify-label
  amplify-form-field --> amplify-input
  amplify-form-field --> amplify-hint
  amplify-examples --> amplify-sign-in
  style amplify-sign-in fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
