# amplify-oauth-button

<!-- Auto Generated Below -->


## Properties

| Property | Attribute | Description                            | Type                      | Default |
| -------- | --------- | -------------------------------------- | ------------------------- | ------- |
| `config` | --        | Federated credentials & configuration. | `{ [key: string]: any; }` | `{}`    |


## Dependencies

### Used by

 - [amplify-federated-buttons](../amplify-federated-buttons)

### Depends on

- [amplify-sign-in-button](../amplify-sign-in-button)

### Graph
```mermaid
graph TD;
  amplify-oauth-button --> amplify-sign-in-button
  amplify-sign-in-button --> amplify-icon
  amplify-federated-buttons --> amplify-oauth-button
  style amplify-oauth-button fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
