# amplify-input



<!-- Auto Generated Below -->


## Properties

| Property      | Attribute     | Description                                                                                                                                        | Type                                                                                            | Default     |
| ------------- | ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | ----------- |
| `description` | `description` | The text of the description.  Goes just below the label.                                                                                           | `string`                                                                                        | `undefined` |
| `fieldId`     | `field-id`    | The ID of the field.  Should match with its corresponding input's ID.                                                                              | `string`                                                                                        | `undefined` |
| `onInput`     | --            | The callback, called when the input is modified by the user.                                                                                       | `(inputEvent: Event) => void`                                                                   | `undefined` |
| `placeholder` | `placeholder` | (optional) The placeholder for the input element.  Using hints is recommended, but placeholders can also be useful to convey information to users. | `string`                                                                                        | `''`        |
| `type`        | `type`        | The input type.  Can be any HTML input type.                                                                                                       | `"date" \| "email" \| "number" \| "password" \| "search" \| "tel" \| "text" \| "time" \| "url"` | `'text'`    |


## Dependencies

### Used by

 - [amplify-form-field](../amplify-form-field)

### Graph
```mermaid
graph TD;
  amplify-form-field --> amplify-input
  style amplify-input fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
