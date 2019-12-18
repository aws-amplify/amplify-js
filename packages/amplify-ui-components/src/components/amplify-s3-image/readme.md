# amplify-s3-image



<!-- Auto Generated Below -->


## Properties

| Property        | Attribute        | Description | Type                                                                 | Default                 |
| --------------- | ---------------- | ----------- | -------------------------------------------------------------------- | ----------------------- |
| `body`          | --               |             | `object`                                                             | `undefined`             |
| `contentType`   | `content-type`   |             | `string`                                                             | `'binary/octet-stream'` |
| `fileToKey`     | --               |             | `(data: object) => string`                                           | `undefined`             |
| `handleOnError` | --               |             | `(event: Event) => void`                                             | `undefined`             |
| `handleOnLoad`  | --               |             | `(event: Event) => void`                                             | `undefined`             |
| `height`        | `height`         |             | `string`                                                             | `undefined`             |
| `hidden`        | `hidden`         |             | `boolean`                                                            | `false`                 |
| `identityId`    | `identity-id`    |             | `string`                                                             | `undefined`             |
| `imgKey`        | `img-key`        |             | `string`                                                             | `undefined`             |
| `level`         | `level`          |             | `AccessLevel.Private \| AccessLevel.Protected \| AccessLevel.Public` | `AccessLevel.Public`    |
| `overrideStyle` | `override-style` |             | `boolean`                                                            | `false`                 |
| `path`          | `path`           |             | `string`                                                             | `undefined`             |
| `picker`        | `picker`         |             | `boolean`                                                            | `false`                 |
| `track`         | `track`          |             | `boolean`                                                            | `undefined`             |
| `width`         | `width`          |             | `string`                                                             | `undefined`             |


## Dependencies

### Used by

 - [amplify-examples](../amplify-examples)

### Graph
```mermaid
graph TD;
  amplify-examples --> amplify-s3-image
  style amplify-s3-image fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
