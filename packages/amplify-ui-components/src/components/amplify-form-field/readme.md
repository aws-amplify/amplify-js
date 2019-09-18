# amplify-form-field



<!-- Auto Generated Below -->


## Properties

| Property        | Attribute        | Description                                                                                                                                        | Type                                                                                            | Default     |
| --------------- | ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | ----------- |
| `description`   | `description`    | The text of the description.  Goes between the label and the input.                                                                                | `string`                                                                                        | `undefined` |
| `fieldId`       | `field-id`       | The ID of the field.  Should match with its corresponding input's ID.                                                                              | `string`                                                                                        | `undefined` |
| `hint`          | `hint`           | The text of a hint to the user as to how to fill out the input.  Goes just below the input.                                                        | `FunctionalComponent<{}> \| string`                                                             | `undefined` |
| `label`         | `label`          | The text of the label.  Goes above the input. Ex: 'First name'                                                                                     | `string`                                                                                        | `undefined` |
| `onInputChange` | --               | The callback, called when the input is modified by the user.                                                                                       | `(inputEvent: Event) => void`                                                                   | `undefined` |
| `overrideStyle` | `override-style` | (Optional) Override default styling                                                                                                                | `boolean`                                                                                       | `false`     |
| `placeholder`   | `placeholder`    | (Optional) The placeholder for the input element.  Using hints is recommended, but placeholders can also be useful to convey information to users. | `string`                                                                                        | `''`        |
| `required`      | `required`       | The required flag in order to make an input required prior to submitting a form                                                                    | `boolean`                                                                                       | `false`     |
| `type`          | `type`           | The input type.  Can be any HTML input type.                                                                                                       | `"date" \| "email" \| "number" \| "password" \| "search" \| "tel" \| "text" \| "time" \| "url"` | `'text'`    |


## Dependencies

### Used by

 - [amplify-auth-fields](../amplify-auth-fields)
 - [amplify-code-field](../amplify-code-field)
 - [amplify-email-field](../amplify-email-field)
 - [amplify-examples](../amplify-examples)
 - [amplify-password-field](../amplify-password-field)
 - [amplify-username-field](../amplify-username-field)

### Depends on

- [amplify-label](../amplify-label)
- [amplify-input](../amplify-input)
- [amplify-hint](../amplify-hint)

### Graph
```mermaid
graph TD;
  amplify-form-field --> amplify-label
  amplify-form-field --> amplify-input
  amplify-form-field --> amplify-hint
  amplify-auth-fields --> amplify-form-field
  amplify-code-field --> amplify-form-field
  amplify-email-field --> amplify-form-field
  amplify-examples --> amplify-form-field
  amplify-password-field --> amplify-form-field
  amplify-username-field --> amplify-form-field
  style amplify-form-field fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
