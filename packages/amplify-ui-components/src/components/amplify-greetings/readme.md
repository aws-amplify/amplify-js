# amplify-greetings



<!-- Auto Generated Below -->


## Properties

| Property                | Attribute | Description                                                                      | Type                                                | Default                                                    |
| ----------------------- | --------- | -------------------------------------------------------------------------------- | --------------------------------------------------- | ---------------------------------------------------------- |
| `handleAuthStateChange` | --        | Passed from the Authenticatior component in order to change Authentication state | `(nextAuthState: AuthState, data?: object) => void` | `undefined`                                                |
| `logo`                  | --        | Logo displayed inside of the header                                              | `object`                                            | `null`                                                     |
| `navItems`              | --        | Items shown in navigation                                                        | `object[]`                                          | `[<span>Hello, {'username'}</span>, <amplify-sign-out />]` |
| `user`                  | --        | Used for the username to be passed to resend code                                | `CognitoUserInterface`                              | `null`                                                     |


## Dependencies

### Used by

 - [amplify-authenticator](../amplify-authenticator)

### Depends on

- [amplify-sign-out](../amplify-sign-out)
- [amplify-nav](../amplify-nav)

### Graph
```mermaid
graph TD;
  amplify-greetings --> amplify-sign-out
  amplify-greetings --> amplify-nav
  amplify-sign-out --> amplify-button
  amplify-authenticator --> amplify-greetings
  style amplify-greetings fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
