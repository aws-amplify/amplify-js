# amplify-greetings



<!-- Auto Generated Below -->


## Properties

| Property                | Attribute        | Description                                                                     | Type                                                | Default     |
| ----------------------- | ---------------- | ------------------------------------------------------------------------------- | --------------------------------------------------- | ----------- |
| `handleAuthStateChange` | --               | Passed from the Authenticator component in order to change Authentication state | `(nextAuthState: AuthState, data?: object) => void` | `undefined` |
| `logo`                  | --               | Logo displayed inside of the header                                             | `FunctionalComponent<{}>`                           | `null`      |
| `overrideStyle`         | `override-style` | Override default styling                                                        | `boolean`                                           | `false`     |
| `user`                  | --               | Used for the username to be passed to resend code                               | `CognitoUserInterface`                              | `null`      |


## Dependencies

### Used by

 - [amplify-authenticator](../amplify-authenticator)

### Depends on

- [amplify-nav](../amplify-nav)
- [amplify-sign-out](../amplify-sign-out)

### Graph
```mermaid
graph TD;
  amplify-greetings --> amplify-nav
  amplify-greetings --> amplify-sign-out
  amplify-sign-out --> amplify-button
  amplify-authenticator --> amplify-greetings
  style amplify-greetings fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
