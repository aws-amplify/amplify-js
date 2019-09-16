# amplify-sign-in



<!-- Auto Generated Below -->


## Properties

| Property           | Attribute           | Description                                                     | Type                   | Default     |
| ------------------ | ------------------- | --------------------------------------------------------------- | ---------------------- | ----------- |
| `handleSubmit`     | --                  | Fires when sign in form is submitted                            | `(Event: any) => void` | `undefined` |
| `overrideStyle`    | `override-style`    | (Optional) Overrides default styling                            | `boolean`              | `false`     |
| `validationErrors` | `validation-errors` | Engages when invalid actions occur, such as missing field, etc. | `string`               | `undefined` |


## Dependencies

### Used by

 - [amplify-authenticator](../amplify-authenticator)
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
  amplify-authenticator --> amplify-sign-in
  amplify-examples --> amplify-sign-in
  style amplify-sign-in fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
