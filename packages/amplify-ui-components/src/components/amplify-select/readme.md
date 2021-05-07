# amplify-select

<!-- Auto Generated Below -->


## Properties

| Property            | Attribute  | Description                                                                                                                 | Type                                             | Default                 |
| ------------------- | ---------- | --------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ | ----------------------- |
| `fieldId`           | `field-id` | Used for id field                                                                                                           | `string`                                         | `undefined`             |
| `handleInputChange` | --         | The callback, called when the select is modified by the user.                                                               | `(inputEvent: Event) => void`                    | `undefined`             |
| `options`           | --         | The options of the select input. Must be an Array of Objects with an Object shape of {label: string, value: string\|number} | `SelectOptions<number> \| SelectOptions<string>` | `DEFAULT_SELECT_OPTION` |
| `selected`          | `selected` | Default selected option                                                                                                     | `number \| string`                               | `undefined`             |


## CSS Custom Properties

| Name                 | Description                                                                    |
| -------------------- | ------------------------------------------------------------------------------ |
| `--background-color` | Background color of the input container                                        |
| `--background-image` | Image of the icon displayed next to text. Defaults to an upside down triangle. |
| `--border-color`     | Border color of the input container                                            |
| `--border-focus`     | Border color of the input container when focused on                            |
| `--color`            | Text color of the select choices                                               |


## Dependencies

### Used by

 - [amplify-country-dial-code](../amplify-country-dial-code)

### Graph
```mermaid
graph TD;
  amplify-country-dial-code --> amplify-select
  style amplify-select fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
