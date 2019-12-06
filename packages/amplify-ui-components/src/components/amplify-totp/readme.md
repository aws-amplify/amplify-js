# amplify-totp

<!-- Auto Generated Below -->

## Properties

| Property      | Attribute | Description | Type                                                                   | Default                |
| ------------- | --------- | ----------- | ---------------------------------------------------------------------- | ---------------------- |
| `authData`    | --        |             | `CognitoUserInterface`                                                 | `null`                 |
| `inputProps`  | --        |             | `object`                                                               | `{ autoFocus: true, }` |
| `onTOTPEvent` | --        |             | `(event: "SETUP_TOTP", data: any, user: CognitoUserInterface) => void` | `undefined`            |

## Dependencies

### Used by

- [amplify-examples](../amplify-examples)

### Depends on

- [amplify-form-field](../amplify-form-field)
- [amplify-form-section](../amplify-form-section)
- [amplify-form-field](../amplify-form-field)

### Graph

```mermaid
graph TD;
  amplify-totp --> amplify-form-field
  amplify-totp --> amplify-form-section
  amplify-form-field --> amplify-label
  amplify-form-field --> amplify-input
  amplify-form-field --> amplify-hint
  amplify-form-section --> amplify-button
  amplify-form-section --> amplify-section
  amplify-form-field --> amplify-label
  amplify-form-field --> amplify-input
  amplify-form-field --> amplify-hint
  amplify-examples --> amplify-totp
  style amplify-totp fill:#f9f,stroke:#333,stroke-width:4px
```

---

_Built with [StencilJS](https://stenciljs.com/)_
