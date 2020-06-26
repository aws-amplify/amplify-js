# amplify-s3-album



<!-- Auto Generated Below -->


## Properties

| Property        | Attribute      | Description | Type                                                                 | Default                              |
| --------------- | -------------- | ----------- | -------------------------------------------------------------------- | ------------------------------------ |
| `contentType`   | `content-type` |             | `string`                                                             | `'binary/octet-stream'`              |
| `fileToKey`     | --             |             | `(data: object) => string`                                           | `undefined`                          |
| `filter`        | --             |             | `(list: StorageObject[]) => StorageObject[]`                         | `undefined`                          |
| `handleOnError` | --             |             | `(event: Event) => void`                                             | `undefined`                          |
| `handleOnLoad`  | --             |             | `(event: Event) => void`                                             | `undefined`                          |
| `identityId`    | `identity-id`  |             | `string`                                                             | `undefined`                          |
| `level`         | `level`        |             | `AccessLevel.Private \| AccessLevel.Protected \| AccessLevel.Public` | `AccessLevel.Public`                 |
| `path`          | `path`         |             | `string`                                                             | `undefined`                          |
| `picker`        | `picker`       |             | `boolean`                                                            | `true`                               |
| `pickerText`    | `picker-text`  |             | `string`                                                             | `I18n.get(Translations.PICKER_TEXT)` |
| `sort`          | --             |             | `(list: StorageObject[]) => StorageObject[]`                         | `undefined`                          |
| `track`         | `track`        |             | `boolean`                                                            | `undefined`                          |


## Dependencies

### Depends on

- [amplify-s3-image](../amplify-s3-image)
- [amplify-picker](../amplify-picker)

### Graph
```mermaid
graph TD;
  amplify-s3-album --> amplify-s3-image
  amplify-s3-album --> amplify-picker
  amplify-picker --> amplify-button
  style amplify-s3-album fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
