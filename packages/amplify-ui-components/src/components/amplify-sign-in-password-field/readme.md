# amplify-sign-in-password-field



<!-- Auto Generated Below -->


## Properties

| Property      | Attribute     | Description | Type                                                  | Default                      |
| ------------- | ------------- | ----------- | ----------------------------------------------------- | ---------------------------- |
| `component`   | --            |             | `Function`                                            | `undefined`                  |
| `description` | `description` |             | `string`                                              | `'Insert your password'`     |
| `fieldId`     | `field-id`    |             | `string`                                              | `'amplify-sign-in-password'` |
| `hint`        | `hint`        |             | `string`                                              | `'Password hint'`            |
| `inputProps`  | --            |             | `{ type?: string; onChange?: (Event: any) => void; }` | `{}`                         |
| `label`       | `label`       |             | `string`                                              | `'Password'`                 |


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
  amplify-sign-in-password-field --> amplify-form-field
  amplify-sign-in-password-field --> context-consumer
  amplify-form-field --> amplify-label
  amplify-form-field --> amplify-hint
  amplify-examples --> amplify-sign-in-password-field
  amplify-sign-in --> amplify-sign-in-password-field
  style amplify-sign-in-password-field fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
