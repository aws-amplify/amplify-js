# amplify-tooltip

<!-- Auto Generated Below -->


## Properties

| Property         | Attribute          | Description                                                                                              | Type      | Default     |
| ---------------- | ------------------ | -------------------------------------------------------------------------------------------------------- | --------- | ----------- |
| `shouldAutoShow` | `should-auto-show` | (Optional) Whether or not the tooltip should be automatically shown, i.e. not disappear when not hovered | `boolean` | `false`     |
| `text`           | `text`             | (Required) The text in the tooltip                                                                       | `string`  | `undefined` |


## Slots

| Slot          | Description                                                    |
| ------------- | -------------------------------------------------------------- |
| `"(default)"` | Text displayed below the tooltip. This will always be visible. |


## CSS Custom Properties

| Name                 | Description                                       |
| -------------------- | ------------------------------------------------- |
| `--background-color` | Background color of the tooltip                   |
| `--border-color`     | Border color of the tooltip                       |
| `--color`            | Text color within the tooltip                     |
| `--font-family`      | Font family of the text placed within the tooltip |


## Dependencies

### Used by

 - [amplify-icon-button](../amplify-icon-button)

### Graph
```mermaid
graph TD;
  amplify-icon-button --> amplify-tooltip
  style amplify-tooltip fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
