# amplify-photo-picker

<!-- Auto Generated Below -->


## Properties

| Property          | Attribute          | Description                                            | Type                   | Default                                      |
| ----------------- | ------------------ | ------------------------------------------------------ | ---------------------- | -------------------------------------------- |
| `buttonText`      | `button-text`      | Picker button text as string                           | `string`               | `Translations.PHOTO_PICKER_BUTTON_TEXT`      |
| `handleClick`     | --                 | Function that handles file pick onClick                | `(file: File) => void` | `() => {}`                                   |
| `headerHint`      | `header-hint`      | Header Hint value in string                            | `string`               | `Translations.PHOTO_PICKER_HINT`             |
| `headerTitle`     | `header-title`     | Title string value                                     | `string`               | `Translations.PHOTO_PICKER_TITLE`            |
| `placeholderHint` | `placeholder-hint` | Placeholder hint that goes under the placeholder image | `string`               | `Translations.PHOTO_PICKER_PLACEHOLDER_HINT` |
| `previewSrc`      | `preview-src`      | Source of the image to be previewed                    | `object \| string`     | `undefined`                                  |


## Dependencies

### Used by

 - [amplify-s3-image-picker](../amplify-s3-image-picker)

### Depends on

- [amplify-section](../amplify-section)
- [amplify-picker](../amplify-picker)
- [amplify-icon](../amplify-icon)
- [amplify-button](../amplify-button)

### Graph
```mermaid
graph TD;
  amplify-photo-picker --> amplify-section
  amplify-photo-picker --> amplify-picker
  amplify-photo-picker --> amplify-icon
  amplify-photo-picker --> amplify-button
  amplify-picker --> amplify-button
  amplify-button --> amplify-icon
  amplify-s3-image-picker --> amplify-photo-picker
  style amplify-photo-picker fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
