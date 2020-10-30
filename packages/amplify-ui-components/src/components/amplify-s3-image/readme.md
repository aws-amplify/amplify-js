# amplify-s3-image

<!-- Auto Generated Below -->


## Properties

| Property        | Attribute      | Description                                          | Type                                                                 | Default                 |
| --------------- | -------------- | ---------------------------------------------------- | -------------------------------------------------------------------- | ----------------------- |
| `body`          | --             | Image body content to be uploaded                    | `object`                                                             | `undefined`             |
| `contentType`   | `content-type` | The content type header used when uploading to S3    | `string`                                                             | `'binary/octet-stream'` |
| `handleOnError` | --             | Function executed when error occurs for the image    | `(event: Event) => void`                                             | `undefined`             |
| `handleOnLoad`  | --             | Function executed when image loads                   | `(event: Event) => void`                                             | `undefined`             |
| `identityId`    | `identity-id`  | Cognito identity id of the another user's image      | `string`                                                             | `undefined`             |
| `imgKey`        | `img-key`      | The key of the image object in S3                    | `string`                                                             | `undefined`             |
| `level`         | `level`        | The access level of the image                        | `AccessLevel.Private \| AccessLevel.Protected \| AccessLevel.Public` | `AccessLevel.Public`    |
| `path`          | `path`         | String representing directory location to image file | `string`                                                             | `undefined`             |
| `track`         | `track`        | Whether or not to use track on get/put of the image  | `boolean`                                                            | `undefined`             |


## CSS Custom Properties

| Name       | Description  |
| ---------- | ------------ |
| `--height` | Image height |
| `--width`  | Image width  |


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
