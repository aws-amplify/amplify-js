# amplify-sign-in-username-field



<!-- Auto Generated Below -->


## Properties

| Property      | Attribute     | Description | Type                                                  | Default                      |
| ------------- | ------------- | ----------- | ----------------------------------------------------- | ---------------------------- |
| `component`   | --            |             | `Function`                                            | `undefined`                  |
| `description` | `description` |             | `string`                                              | `'Insert your username'`     |
| `fieldId`     | `field-id`    |             | `string`                                              | `'amplify-sign-in-username'` |
| `hint`        | `hint`        |             | `string`                                              | `'Username hint'`            |
| `inputProps`  | --            |             | `{ type?: string; onChange?: (Event: any) => void; }` | `{}`                         |
| `label`       | `label`       |             | `string`                                              | `'Username'`                 |


## Dependencies

### Used by

 - [amplify-examples](../amplify-examples)
 - [amplify-sign-in](../amplify-sign-in)

### Depends on

- [amplify-form-field](../amplify-form-field)
- context-consumer

### Graph
```mermaid
graph TD;
  amplify-sign-in-username-field --> amplify-form-field
  amplify-sign-in-username-field --> context-consumer
  amplify-form-field --> amplify-label
  amplify-form-field --> amplify-text-input
  amplify-form-field --> amplify-hint
  amplify-examples --> amplify-sign-in-username-field
  amplify-sign-in --> amplify-sign-in-username-field
  style amplify-sign-in-username-field fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
