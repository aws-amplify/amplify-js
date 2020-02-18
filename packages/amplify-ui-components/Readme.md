# Amplify UI Components (Preview) <img style="float: right;" src="https://img.shields.io/badge/-Built%20With%20Stencil-16161d.svg?logo=data%3Aimage%2Fsvg%2Bxml%3Bbase64%2CPD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDE5LjIuMSwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IgoJIHZpZXdCb3g9IjAgMCA1MTIgNTEyIiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA1MTIgNTEyOyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI%2BCjxzdHlsZSB0eXBlPSJ0ZXh0L2NzcyI%2BCgkuc3Qwe2ZpbGw6I0ZGRkZGRjt9Cjwvc3R5bGU%2BCjxwYXRoIGNsYXNzPSJzdDAiIGQ9Ik00MjQuNywzNzMuOWMwLDM3LjYtNTUuMSw2OC42LTkyLjcsNjguNkgxODAuNGMtMzcuOSwwLTkyLjctMzAuNy05Mi43LTY4LjZ2LTMuNmgzMzYuOVYzNzMuOXoiLz4KPHBhdGggY2xhc3M9InN0MCIgZD0iTTQyNC43LDI5Mi4xSDE4MC40Yy0zNy42LDAtOTIuNy0zMS05Mi43LTY4LjZ2LTMuNkgzMzJjMzcuNiwwLDkyLjcsMzEsOTIuNyw2OC42VjI5Mi4xeiIvPgo8cGF0aCBjbGFzcz0ic3QwIiBkPSJNNDI0LjcsMTQxLjdIODcuN3YtMy42YzAtMzcuNiw1NC44LTY4LjYsOTIuNy02OC42SDMzMmMzNy45LDAsOTIuNywzMC43LDkyLjcsNjguNlYxNDEuN3oiLz4KPC9zdmc%2BCg%3D%3D&colorA=16161d&style=flat-square">

[Amplify UI Components (Preview)](#) is an open-source UI component library that encapsulates cloud-connected workflows inside of framework-agnostic UI components.

## Frameworks

| Framework          | Package                                                                                  | Version                                                                                                                                    |                        READMEs                        | Quick Start                         |
| ------------------ | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | :---------------------------------------------------: | ----------------------------------- |
| **Web Components** | [`@aws-amplify/ui-components`](https://www.npmjs.com/package/@aws-amplify/ui-components) | [![version](https://img.shields.io/npm/v/@aws-amplify/ui-components/latest.svg)](https://www.npmjs.com/package/@aws-amplify/ui-components) |    [`README.md`](amplify-ui-components/README.md)     | [`Web Components`](#web-components) |
| **Angular**        | [`@aws-amplify/ui-angular`](https://www.npmjs.com/package/@aws-amplify/ui-angular)       | [![version](https://img.shields.io/npm/v/@aws-amplify/ui-angular/latest.svg)](https://www.npmjs.com/package/@aws-amplify/ui-angular)       |    [`README.md`](../amplify-ui-angular/README.md)     | [`Angular`](#angular)               |
| **Vue**            | [`@aws-amplify/ui-vue`](https://www.npmjs.com/package/@aws-amplify/ui-vue)               | [![version](https://img.shields.io/npm/v/@aws-amplify/ui-vue/latest.svg)](https://www.npmjs.com/package/@aws-amplify/ui-vue)               |      [`README.md`](../amplify-ui-vue/README.md)       | [`Vue`](#vue)                       |
| **React**          | [`@aws-amplify/ui-react`](https://www.npmjs.com/package/@aws-amplify/ui-react)           | [![version](https://img.shields.io/npm/v/@aws-amplify/ui-react/latest.svg)](https://www.npmjs.com/package/@aws-amplify/ui-react)           | [`README.md`](../packages/amplify-ui-react/README.md) | [`React`](#react)                   |

## Quick Start

- [React](#react)
- [Angular](#angular)
- [Vue](#vue)
- [Web Components](#web-components)

#### React

##### Installation

```
yarn add @aws-amplify/ui-react
```

##### Usage

```
import React from 'react';
import { AmplifyAuthenticator } from '@aws-amplify/ui-react';

const App = () => (
	<AmplifyAuthenticator />
);
```

#### Angular

##### Installation

```
yarn add @aws-amplify/ui-angular
```

##### Usage

```
import React from 'react';
import { AmplifyAuthenticator, AmplifySignOut } from '@aws-amplify/ui-react';

const App = () => (
	<AmplifyAuthenticator>
		<div>My App</div>
	</AmplifyAuthenticator>
);
```

#### Vue

##### Installation

```
yarn add @aws-amplify/ui-vue
```

##### Usage

```
import Vue from 'vue'
import { AmplifyAuthenticator } from '@aws-amplify/ui-vue'

Vue.use(AmplifyAuthenticator)

new Vue({
    components: {
        AmplifyAuthenticator
    }
});

<div id="app">
    <amplify-authenticator>
			<div>My App</div>
		</amplify-authenticator>
</div>
```

#### Web Components

##### Installation

```
yarn add @aws-amplify/ui-components
```

##### Usage

```
<!DOCTYPE html>
<html lang="en">
<head>
  <script src="https://unpkg.com/@aws-amplify/ui-components/latest/dist/amplify-ui-components.js"></script>
</head>
<body>
  <amplify-authenticator></amplify-authenticator>
</body>
</html>

```

## Component READMEs

- [amplify-authenticator](src/components/amplify-authenticator/readme.md)

- [amplify-sign-in](src/components/amplify-sign-in/readme.md)

- [amplify-sign-up](src/components/amplify-sign-up/readme.md)

- [amplify-sign-out](src/components/amplify-sign-out/readme.md)

- [amplify-confirm-sign-up](src/components/amplify-confirm-sign-up/readme.md)

- [amplify-forgot-password](src/components/amplify-forgot-password/readme.md)

- [amplify-require-new-password](src/components/amplify-require-new-password/readme.md)

- [amplify-verify-contact](src/components/amplify-verify-contact/readme.md)

- [amplify-totp-setup](src/components/amplify-totp-setup/readme.md)
