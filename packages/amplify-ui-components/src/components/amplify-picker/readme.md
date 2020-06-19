# amplify-picker

<!-- Auto Generated Below -->


## Properties

| Property       | Attribute      | Description | Type                 | Default                              |
| -------------- | -------------- | ----------- | -------------------- | ------------------------------------ |
| `acceptValue`  | `accept-value` |             | `string`             | `'*/*'`                              |
| `inputHandler` | --             |             | `(e: Event) => void` | `undefined`                          |
| `pickerText`   | `picker-text`  |             | `string`             | `I18n.get(Translations.PICKER_TEXT)` |


## Dependencies

### Used by

 - [amplify-photo-picker](../amplify-photo-picker)
 - [amplify-s3-text-picker](../amplify-s3-text-picker)

### Depends on

- [amplify-button](../amplify-button)

### Graph
```mermaid
graph TD;
  amplify-picker --> amplify-button
  amplify-photo-picker --> amplify-picker
  amplify-s3-text-picker --> amplify-picker
  style amplify-picker fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
