# amplify-totp



<!-- Auto Generated Below -->


## Properties

| Property      | Attribute | Description                                                      | Type                                                                   | Default                      |
| ------------- | --------- | ---------------------------------------------------------------- | ---------------------------------------------------------------------- | ---------------------------- |
| `authData`    | --        | Used in order to configure TOTP for a user                       | `CognitoUserInterface`                                                 | `null`                       |
| `inputProps`  | --        | Used to set autoFocus to true when TOTP Component has loaded     | `object`                                                               | `{     autoFocus: true,   }` |
| `onTOTPEvent` | --        | Triggers an TOTP Event after handleSubmit method has been called | `(event: "SETUP_TOTP", data: any, user: CognitoUserInterface) => void` | `undefined`                  |


## Dependencies

### Used by

 - [amplify-examples](../amplify-examples)

### Depends on

- [amplify-form-section](../amplify-form-section)
- [amplify-form-field](../amplify-form-field)

### Graph
```mermaid
graph TD;
  amplify-totp --> amplify-form-section
  amplify-totp --> amplify-form-field
  amplify-form-section --> amplify-button
  amplify-form-section --> amplify-section
  amplify-form-field --> amplify-label
  amplify-form-field --> amplify-input
  amplify-form-field --> amplify-hint
  amplify-examples --> amplify-totp
  style amplify-totp fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
