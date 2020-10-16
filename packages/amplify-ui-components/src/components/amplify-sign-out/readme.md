# amplify-sign-out

<!-- Auto Generated Below -->


## Properties

| Property                | Attribute     | Description                                  | Type                                                | Default                        |
| ----------------------- | ------------- | -------------------------------------------- | --------------------------------------------------- | ------------------------------ |
| `buttonText`            | `button-text` | Text inside of the Sign Out button           | `string`                                            | `Translations.SIGN_OUT`        |
| `handleAuthStateChange` | --            | Auth state change handler for this component | `(nextAuthState: AuthState, data?: object) => void` | `dispatchAuthStateChangeEvent` |


## Slots

| Slot         | Description                 |
| ------------ | --------------------------- |
| `"sign-out"` | The sign out button element |


## Dependencies

### Used by

 - [amplify-greetings](../amplify-greetings)

### Depends on

- [amplify-button](../amplify-button)

### Graph
```mermaid
graph TD;
  amplify-sign-out --> amplify-button
  amplify-button --> amplify-icon
  amplify-greetings --> amplify-sign-out
  style amplify-sign-out fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
