# amplify-field



<!-- Auto Generated Below -->


## Properties

| Property      | Attribute     | Description                                                                                 | Type                                                                                            | Default     |
| ------------- | ------------- | ------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | ----------- |
| `description` | `description` | The text of the description.  Goes between the label and the input.                         | `string`                                                                                        | `undefined` |
| `fieldId`     | `field-id`    | The ID of the field.  Should match with its corresponding input's ID.                       | `string`                                                                                        | `undefined` |
| `hint`        | `hint`        | The text of a hint to the user as to how to fill out the input.  Goes just below the input. | `string`                                                                                        | `undefined` |
| `label`       | `label`       | The text of the label.  Goes above the input. Ex: "First name"                              | `string`                                                                                        | `undefined` |
| `onInput`     | --            | The callback, called when the input is modified by the user.                                | `(arg0: Event) => void`                                                                         | `undefined` |
| `type`        | `type`        | The input type.  Can be any HTML input type.                                                | `"date" \| "email" \| "number" \| "password" \| "search" \| "tel" \| "text" \| "time" \| "url"` | `"text"`    |


## Dependencies

### Used by

 - [amplify-examples](../amplify-examples)
 - [amplify-sign-in-password-field](../amplify-sign-in-password-field)
 - [amplify-sign-in-username-field](../amplify-sign-in-username-field)

### Depends on

- [amplify-input](../amplify-input)
- [amplify-hint](../amplify-hint)

### Graph
```mermaid
graph TD;
  amplify-form-field --> amplify-input
  amplify-form-field --> amplify-hint
  amplify-examples --> amplify-form-field
  amplify-sign-in-password-field --> amplify-form-field
  amplify-sign-in-username-field --> amplify-form-field
  style amplify-form-field fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
