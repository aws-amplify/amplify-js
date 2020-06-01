# amplify-s3-image-picker



<!-- Auto Generated Below -->


## Properties

| Property          | Attribute          | Description | Type                                                                 | Default                                                   |
| ----------------- | ------------------ | ----------- | -------------------------------------------------------------------- | --------------------------------------------------------- |
| `buttonText`      | `button-text`      |             | `string`                                                             | `'Upload'`                                                |
| `contentType`     | `content-type`     |             | `string`                                                             | `'binary/octet-stream'`                                   |
| `fileToKey`       | --                 |             | `(data: object) => string`                                           | `undefined`                                               |
| `headerHint`      | `header-hint`      |             | `string`                                                             | `'Ancilliary text or content may occupy this space here'` |
| `headerTitle`     | `header-title`     |             | `string`                                                             | `'Add Profile Photos'`                                    |
| `identityId`      | `identity-id`      |             | `string`                                                             | `undefined`                                               |
| `level`           | `level`            |             | `AccessLevel.Private \| AccessLevel.Protected \| AccessLevel.Public` | `AccessLevel.Public`                                      |
| `path`            | `path`             |             | `string`                                                             | `undefined`                                               |
| `placeholderHint` | `placeholder-hint` |             | `string`                                                             | `'Placeholder hint'`                                      |
| `track`           | `track`            |             | `boolean`                                                            | `undefined`                                               |


## Dependencies

### Depends on

- [amplify-photo-picker](../amplify-photo-picker)

### Graph
```mermaid
graph TD;
  amplify-s3-image-picker --> amplify-photo-picker
  amplify-photo-picker --> amplify-section
  amplify-photo-picker --> amplify-picker
  amplify-photo-picker --> amplify-photo-placeholder
  amplify-photo-picker --> amplify-button
  amplify-picker --> amplify-button
  style amplify-s3-image-picker fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
