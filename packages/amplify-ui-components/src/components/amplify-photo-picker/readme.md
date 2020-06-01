# amplify-photo-picker

<!-- Auto Generated Below -->


## Properties

| Property          | Attribute          | Description | Type                   | Default                                                    |
| ----------------- | ------------------ | ----------- | ---------------------- | ---------------------------------------------------------- |
| `buttonText`      | `button-text`      |             | `string`               | `'Button'`                                                 |
| `headerHint`      | `header-hint`      |             | `string`               | `'Ancilliary text or content may occupy this space here.'` |
| `headerTitle`     | `header-title`     |             | `string`               | `'Header Title'`                                           |
| `onClickHandler`  | --                 |             | `(file: File) => void` | `() => {}`                                                 |
| `placeholderHint` | `placeholder-hint` |             | `string`               | `'Placeholder hint'`                                       |
| `previewSrc`      | `preview-src`      |             | `object \| string`     | `undefined`                                                |


## Dependencies

### Used by

 - [amplify-s3-image-picker](../amplify-s3-image-picker)

### Depends on

- [amplify-section](../amplify-section)
- [amplify-picker](../amplify-picker)
- [amplify-photo-placeholder](../amplify-photo-placeholder)
- [amplify-button](../amplify-button)

### Graph
```mermaid
graph TD;
  amplify-photo-picker --> amplify-section
  amplify-photo-picker --> amplify-picker
  amplify-photo-picker --> amplify-photo-placeholder
  amplify-photo-picker --> amplify-button
  amplify-picker --> amplify-button
  amplify-s3-image-picker --> amplify-photo-picker
  style amplify-photo-picker fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
