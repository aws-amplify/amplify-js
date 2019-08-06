# amplify-input



<!-- Auto Generated Below -->


## Properties

| Property      | Attribute     | Description                                                           | Type                    | Default     |
| ------------- | ------------- | --------------------------------------------------------------------- | ----------------------- | ----------- |
| `description` | `description` | The text of the description.  Goes just below the label.              | `string`                | `undefined` |
| `fieldId`     | `field-id`    | The ID of the field.  Should match with its corresponding input's ID. | `string`                | `undefined` |
| `onInput`     | --            | The callback, called when the input is modified by the user.          | `(arg0: Event) => void` | `undefined` |
| `type`        | `type`        | The input type.  Can be any HTML input type.                          | `string`                | `"text"`    |


## Dependencies

### Used by

 - [amplify-field](../amplify-field)
 - [amplify-form-field](../amplify-form-field)

### Graph
```mermaid
graph TD;
  amplify-field --> amplify-input
  amplify-form-field --> amplify-input
  style amplify-input fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
