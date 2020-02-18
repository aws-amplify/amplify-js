# Amplify UI Components (Preview)

[Amplify UI Components (Preview)](#) is an open-source UI component library that encapsulates cloud-connected workflows inside of framework-agnostic UI components.

## Frameworks

| Framework          | Package                                                                                  | Version                                                                                                                                    |                        READMEs                        | Quick Start                         |
| ------------------ | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | :---------------------------------------------------: | ----------------------------------- |
| **React**          | [`@aws-amplify/ui-react`](https://www.npmjs.com/package/@aws-amplify/ui-react)           | [![version](https://img.shields.io/npm/v/@aws-amplify/ui-react/latest.svg)](https://www.npmjs.com/package/@aws-amplify/ui-react)           | [`README.md`](../packages/amplify-ui-react/README.md) | [`React`](#react)                   |
| **Angular**        | [`@aws-amplify/ui-angular`](https://www.npmjs.com/package/@aws-amplify/ui-angular)       | [![version](https://img.shields.io/npm/v/@aws-amplify/ui-angular/latest.svg)](https://www.npmjs.com/package/@aws-amplify/ui-angular)       |    [`README.md`](../amplify-ui-angular/README.md)     | [`Angular`](#angular)               |
| **Vue**            | [`@aws-amplify/ui-vue`](https://www.npmjs.com/package/@aws-amplify/ui-vue)               | [![version](https://img.shields.io/npm/v/@aws-amplify/ui-vue/latest.svg)](https://www.npmjs.com/package/@aws-amplify/ui-vue)               |      [`README.md`](../amplify-ui-vue/README.md)       | [`Vue`](#vue)                       |
| **Web Components** | [`@aws-amplify/ui-components`](https://www.npmjs.com/package/@aws-amplify/ui-components) | [![version](https://img.shields.io/npm/v/@aws-amplify/ui-components/latest.svg)](https://www.npmjs.com/package/@aws-amplify/ui-components) |    [`README.md`](amplify-ui-components/README.md)     | [`Web Components`](#web-components) |

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

```js
import React from 'react';
import { AmplifyAuthenticator } from '@aws-amplify/ui-react';

const App = () => <AmplifyAuthenticator />;
```

#### Angular

##### Installation

```
yarn add @aws-amplify/ui-angular
```

##### Usage

_app.module.ts_

```js
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AmplifyModule } from '@aws-amplify/ui-angular';

import { AppComponent } from './app.component';

@NgModule({
  declarations: [AppComponent],
  imports: [AmplifyModule, BrowserModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
```

_app.component.html_

```html
<amplify-authenticator>
  <div>My App</div>
</amplify-authenticator>
```

#### Vue

##### Installation

```
yarn add @aws-amplify/ui-vue
```

##### Usage

_main.ts_

```js
import Vue from 'vue';
import { AmplifyAuthenticator } from '@aws-amplify/ui-vue';

Vue.use(AmplifyAuthenticator);

new Vue({
  components: {
    AmplifyAuthenticator,
  },
});
```

_App.vue_

```html
<template>
  <div id="app">
    <amplify-authenticator>
      <div>My App</div>
    </amplify-authenticator>
  </div>
</template>
```

#### Web Components

##### Installation

```
yarn add @aws-amplify/ui-components
```

##### Usage

```html
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

## Components

- #### [amplify-authenticator](src/components/amplify-authenticator/readme.md)

<img alt="amplify-authenticator" src="https://user-images.githubusercontent.com/3868826/74710028-86392f80-51d5-11ea-951a-d582cb55d351.png">

- [amplify-sign-in](src/components/amplify-sign-in/readme.md)

- [amplify-sign-up](src/components/amplify-sign-up/readme.md)

- [amplify-sign-out](src/components/amplify-sign-out/readme.md)

- [amplify-confirm-sign-up](src/components/amplify-confirm-sign-up/readme.md)

- [amplify-forgot-password](src/components/amplify-forgot-password/readme.md)

- [amplify-require-new-password](src/components/amplify-require-new-password/readme.md)

- [amplify-verify-contact](src/components/amplify-verify-contact/readme.md)

- [amplify-totp-setup](src/components/amplify-totp-setup/readme.md)

## Migration Guide

- [React](#react)
- [Angular](#angular)
- [Vue](#vue)
- [Web Components](#web-components)

#### React

##### Installation

```diff
- yarn add aws-amplify-react
+ yarn add @aws-amplify/ui-react
```

##### Usage

```diff
import React from 'react';
- import { Authenticator } from 'aws-amplify-react';
+ import { AmplifyAuthenticator } from '@aws-amplify/ui-react';

const App = () => (
-  <Authenticator />
+  <AmplifyAuthenticator />
);
```

#### Angular

##### Installation

```diff
- yarn add aws-amplify-angular
+ yarn add @aws-amplify/ui-angular
```

##### Usage

_app.module.ts_

```diff
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
- import { AmplifyAngularModule, AmplifyService } from 'aws-amplify-angular';
+ import { AmplifyModule } from '@aws-amplify/ui-angular';

import { AppComponent } from './app.component';

@NgModule({
  declarations: [AppComponent],
  imports: [AmplifyModule, BrowserModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
```

_app.component.html_

```html
<amplify-authenticator>
  <div>My App</div>
</amplify-authenticator>
```

#### Vue

##### Installation

```diff
- yarn add aws-amplify-vue
+ yarn add @aws-amplify/ui-vue
```

##### Usage

_main.ts_

```diff
import Vue from 'vue';
- import Amplify, * as AmplifyModules from 'aws-amplify'
- import { AmplifyPlugin } from 'aws-amplify-vue'
+ import { AmplifyAuthenticator } from '@aws-amplify/ui-vue';

- Vue.use(AmplifyPlugin, AmplifyModules)
+ Vue.use(AmplifyAuthenticator);

new Vue({
  components: {
    AmplifyAuthenticator,
  },
});
```

_App.vue_

```diff
<template>
  <div id="app">
    <amplify-authenticator>
      <div>My App</div>
    </amplify-authenticator>
  </div>
</template>
```

---

![Built With Stencil](https://img.shields.io/badge/-Built%20With%20Stencil-16161d.svg?logo=data%3Aimage%2Fsvg%2Bxml%3Bbase64%2CPD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDE5LjIuMSwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IgoJIHZpZXdCb3g9IjAgMCA1MTIgNTEyIiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA1MTIgNTEyOyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI%2BCjxzdHlsZSB0eXBlPSJ0ZXh0L2NzcyI%2BCgkuc3Qwe2ZpbGw6I0ZGRkZGRjt9Cjwvc3R5bGU%2BCjxwYXRoIGNsYXNzPSJzdDAiIGQ9Ik00MjQuNywzNzMuOWMwLDM3LjYtNTUuMSw2OC42LTkyLjcsNjguNkgxODAuNGMtMzcuOSwwLTkyLjctMzAuNy05Mi43LTY4LjZ2LTMuNmgzMzYuOVYzNzMuOXoiLz4KPHBhdGggY2xhc3M9InN0MCIgZD0iTTQyNC43LDI5Mi4xSDE4MC40Yy0zNy42LDAtOTIuNy0zMS05Mi43LTY4LjZ2LTMuNkgzMzJjMzcuNiwwLDkyLjcsMzEsOTIuNyw2OC42VjI5Mi4xeiIvPgo8cGF0aCBjbGFzcz0ic3QwIiBkPSJNNDI0LjcsMTQxLjdIODcuN3YtMy42YzAtMzcuNiw1NC44LTY4LjYsOTIuNy02OC42SDMzMmMzNy45LDAsOTIuNywzMC43LDkyLjcsNjguNlYxNDEuN3oiLz4KPC9zdmc%2BCg%3D%3D&colorA=16161d&style=flat-square)
