# amplify-code-field

<!-- Auto Generated Below -->


## Properties

| Property            | Attribute     | Description                                                                                                        | Type                                | Default                          |
| ------------------- | ------------- | ------------------------------------------------------------------------------------------------------------------ | ----------------------------------- | -------------------------------- |
| `dialCode`          | `dial-code`   | Default dial code in the phone field                                                                               | `number \| string`                  | `undefined`                      |
| `disabled`          | `disabled`    | Will disable the input if set to true                                                                              | `boolean`                           | `undefined`                      |
| `fieldId`           | `field-id`    | Based on the type of field e.g. sign in, sign up, forgot password, etc.                                            | `string`                            | `PHONE_SUFFIX`                   |
| `handleInputChange` | --            | The callback, called when the input is modified by the user.                                                       | `(inputEvent: Event) => void`       | `undefined`                      |
| `hint`              | `hint`        | Used as the hint in case you forgot your confirmation code, etc.                                                   | `FunctionalComponent<{}> \| string` | `undefined`                      |
| `inputProps`        | --            | Attributes places on the input element: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#Attributes | `object`                            | `undefined`                      |
| `label`             | `label`       | Used for the Phone label                                                                                           | `string`                            | `Translations.PHONE_LABEL`       |
| `placeholder`       | `placeholder` | Used for the placeholder label                                                                                     | `string`                            | `Translations.PHONE_PLACEHOLDER` |
| `required`          | `required`    | The required flag in order to make an input required prior to submitting a form                                    | `boolean`                           | `false`                          |
| `value`             | `value`       | The value of the content inside of the input field                                                                 | `string`                            | `undefined`                      |


## Dependencies

### Used by

 - [amplify-auth-fields](../amplify-auth-fields)

### Depends on

- [amplify-form-field](../amplify-form-field)
- [amplify-country-dial-code](../amplify-country-dial-code)
- [amplify-input](../amplify-input)

### Graph
```mermaid
graph TD;
  amplify-phone-field --> amplify-form-field
  amplify-phone-field --> amplify-country-dial-code
  amplify-phone-field --> amplify-input
  amplify-form-field --> amplify-label
  amplify-form-field --> amplify-input
  amplify-form-field --> amplify-hint
  amplify-country-dial-code --> amplify-select
  amplify-auth-fields --> amplify-phone-field
  style amplify-phone-field fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
