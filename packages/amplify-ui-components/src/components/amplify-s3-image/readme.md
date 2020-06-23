# amplify-s3-image

<!-- Auto Generated Below -->


## Properties

| Property        | Attribute      | Description | Type                                                                 | Default                 |
| --------------- | -------------- | ----------- | -------------------------------------------------------------------- | ----------------------- |
| `body`          | --             |             | `object`                                                             | `undefined`             |
| `contentType`   | `content-type` |             | `string`                                                             | `'binary/octet-stream'` |
| `handleOnError` | --             |             | `(event: Event) => void`                                             | `undefined`             |
| `handleOnLoad`  | --             |             | `(event: Event) => void`                                             | `undefined`             |
| `identityId`    | `identity-id`  |             | `string`                                                             | `undefined`             |
| `imgKey`        | `img-key`      |             | `string`                                                             | `undefined`             |
| `level`         | `level`        |             | `AccessLevel.Private \| AccessLevel.Protected \| AccessLevel.Public` | `AccessLevel.Public`    |
| `path`          | `path`         |             | `string`                                                             | `undefined`             |
| `track`         | `track`        |             | `boolean`                                                            | `undefined`             |


## Dependencies

### Used by

 - [amplify-s3-album](../amplify-s3-album)

### Graph
```mermaid
graph TD;
  amplify-s3-album --> amplify-s3-image
  style amplify-s3-image fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
