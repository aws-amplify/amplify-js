# amplify-greetings



<!-- Auto Generated Below -->


## Properties

| Property                | Attribute  | Description                                  | Type                                                | Default                        |
| ----------------------- | ---------- | -------------------------------------------- | --------------------------------------------------- | ------------------------------ |
| `handleAuthStateChange` | --         | Auth state change handler for this component | `(nextAuthState: AuthState, data?: object) => void` | `dispatchAuthStateChangeEvent` |
| `logo`                  | --         | Logo displayed inside of the header          | `FunctionalComponent<{}>`                           | `null`                         |
| `username`              | `username` | Username displayed in the greetings          | `string`                                            | `null`                         |


## Slots

| Slot                  | Description                                                     |
| --------------------- | --------------------------------------------------------------- |
| `"greetings-message"` | Content placed in the greetings text                            |
| `"logo"`              | Left-justified content placed at the start of the greetings bar |
| `"nav"`               | Right-justified content placed at the end of the greetings bar  |


## CSS Custom Properties

| Name                 | Description                       |
| -------------------- | --------------------------------- |
| `--background-color` | Background color of the container |
| `--border-color`     | Border color of the container     |
| `--font-family`      | Font family of the text           |


## Dependencies

### Depends on

- [amplify-nav](../amplify-nav)
- [amplify-sign-out](../amplify-sign-out)

### Graph
```mermaid
graph TD;
  amplify-greetings --> amplify-nav
  amplify-greetings --> amplify-sign-out
  amplify-sign-out --> amplify-button
  amplify-button --> amplify-icon
  style amplify-greetings fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
