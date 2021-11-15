# Amplify UI Components

[Amplify UI Components](#) is an open-source UI component library that encapsulates cloud-connected workflows inside of framework-agnostic UI components.

## Frameworks

| Framework          | Package                                                                                  | Version                                                                                                                                    |                    READMEs                     | Quick Start                         |
| ------------------ | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | :--------------------------------------------: | ----------------------------------- |
| **React**          | [`@aws-amplify/ui-react`](https://www.npmjs.com/package/@aws-amplify/ui-react)           | [![version](https://img.shields.io/npm/v/@aws-amplify/ui-react/latest.svg)](https://www.npmjs.com/package/@aws-amplify/ui-react)           |  [`README.md`](../amplify-ui-react/README.md)  | [`React`](#react)                   |
| **Angular**        | [`@aws-amplify/ui-angular`](https://www.npmjs.com/package/@aws-amplify/ui-angular)       | [![version](https://img.shields.io/npm/v/@aws-amplify/ui-angular/latest.svg)](https://www.npmjs.com/package/@aws-amplify/ui-angular)       | [`README.md`](../amplify-ui-angular/README.md) | [`Angular`](#angular)               |
| **Vue**            | [`@aws-amplify/ui-vue`](https://www.npmjs.com/package/@aws-amplify/ui-vue)               | [![version](https://img.shields.io/npm/v/@aws-amplify/ui-vue/latest.svg)](https://www.npmjs.com/package/@aws-amplify/ui-vue)               |   [`README.md`](../amplify-ui-vue/README.md)   | [`Vue`](#vue)                       |
| **Web Components** | [`@aws-amplify/ui-components`](https://www.npmjs.com/package/@aws-amplify/ui-components) | [![version](https://img.shields.io/npm/v/@aws-amplify/ui-components/latest.svg)](https://www.npmjs.com/package/@aws-amplify/ui-components) |            [`README.md`](README.md)            | [`Web Components`](#web-components) |

## Quick Start

In this Quick Start guide you will set up an Authenticator component and the cloud resources required to use it inside of your app.

**Prerequisites**

- Follow [Get Started](https://aws-amplify.github.io/docs/) on Amplify Docs.
- Use [Amplify CLI](https://aws-amplify.github.io/docs/cli-toolchain/quickstart#auth-examples) to initialize your project set up Auth cloud resources.

**Frameworks**

- [React](#react)
- [Angular](#angular)
- [Vue](#vue)
- [Web Components](#web-components)

#### React

##### Installation

```
yarn add aws-amplify @aws-amplify/ui-react
```

##### Usage

```js
import React from 'react';
import Amplify from 'aws-amplify';
import { AmplifyAuthenticator, AmplifySignOut } from '@aws-amplify/ui-react';
import awsconfig from './aws-exports';

Amplify.configure(awsconfig);

const App = () => {
	<AmplifyAuthenticator>
		<div>
			My App
			<AmplifySignOut />
		</div>
	</AmplifyAuthenticator>;
};
```

#### Angular

##### Installation

```
yarn add aws-amplify @aws-amplify/ui-angular
```

##### Usage

_app.module.ts_

```js
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';

import { AmplifyUIAngularModule } from '@aws-amplify/ui-angular';
import Amplify from 'aws-amplify';
import awsconfig from './aws-exports';

Amplify.configure(awsconfig);

@NgModule({
	declarations: [AppComponent],
	imports: [AmplifyUIAngularModule, BrowserModule],
	providers: [],
	bootstrap: [AppComponent],
})
export class AppModule {}
```

_app.component.html_

```html
<amplify-authenticator>
	<div>
		My App
		<amplify-sign-out></amplify-sign-out>
	</div>
</amplify-authenticator>
```

#### Vue

##### Installation

```
yarn add aws-amplify @aws-amplify/ui-vue
```

##### Usage

_main.ts_

```js
import Vue from 'vue';
import App from './App.vue';
import '@aws-amplify/ui-vue';
import Amplify from 'aws-amplify';
import awsconfig from './aws-exports';

Amplify.configure(awsconfig);

new Vue({
	render: (h) => h(App),
}).$mount('#app');
```

_App.vue_

```html
<template>
	<amplify-authenticator>
		<div>
			My App
			<amplify-sign-out></amplify-sign-out>
		</div>
	</amplify-authenticator>
</template>
```

#### Web Components

##### Installation

```
yarn add aws-amplify @aws-amplify/ui-components
```

##### Usage

_app.js_

```js
import Amplify from 'aws-amplify';
import awsconfig from './aws-exports';
Amplify.configure(awsconfig);
import {
	applyPolyfills,
	defineCustomElements,
} from '@aws-amplify/ui-components/loader';

applyPolyfills().then(() => {
	defineCustomElements(window);
});
```

_index.html_

```html
<!DOCTYPE html>
<html lang="en">
	<body>
		<amplify-authenticator>
			<div>
				My App
				<amplify-sign-out></amplify-sign-out>
			</div>
		</amplify-authenticator>

		<script src="app.js"></script>
	</body>
</html>
```

## Components

- #### [amplify-authenticator](src/components/amplify-authenticator/readme.md)

<img width="450" alt="amplify-authenticator" src="https://user-images.githubusercontent.com/3868826/74710028-86392f80-51d5-11ea-951a-d582cb55d351.png">

- [amplify-sign-in](src/components/amplify-sign-in/readme.md)

- [amplify-sign-up](src/components/amplify-sign-up/readme.md)

- [amplify-sign-out](src/components/amplify-sign-out/readme.md)

- [amplify-confirm-sign-up](src/components/amplify-confirm-sign-up/readme.md)

- [amplify-forgot-password](src/components/amplify-forgot-password/readme.md)

- [amplify-require-new-password](src/components/amplify-require-new-password/readme.md)

- [amplify-verify-contact](src/components/amplify-verify-contact/readme.md)

- [amplify-totp-setup](src/components/amplify-totp-setup/readme.md)

- [amplify-greetings](src/components/amplify-greetings/readme.md)

## Customization

Amplify UI Components use [slots](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/slot) to allow for component customization. Component customization and slot usage is exemplified below.

### Amplify Authenticator

**Slots**

> You can override the [components listed above](#components) and pass them into these slots to preserve the authenticator state flow.

| Name                     | Description                                                                                                            |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------- |
| `"sign-in"`              | Content placed inside of the sign in workflow for when a user wants to sign into their account                         |
| `"confirm-sign-in"`      | Content placed inside of the confirm sign in workflow for when a user needs to confirm the account they signed in with |
| `"sign-up"`              | Content placed inside of the sign up workflow for when a user wants to register a new account                          |
| `"confirm-sign-up"`      | Content placed inside of the confirm sign up workflow for when a user needs to confirm the account they signed up with |
| `"forgot-password"`      | Content placed inside of the forgot password workflow for when a user wants to reset their password                    |
| `"require-new-password"` | Content placed inside of the require new password workflow for when a user is required to update their password        |
| `"verify-contact"`       | Content placed inside of the verify-contact workflow for when a user must verify their contact information             |
| `"totp-setup"`           | Content placed inside of the totp-setup workflow for when a user opts to use TOTP MFA                                  |
| `"greetings"`            | Content placed inside of the greetings navigation for when a user is signed in                                         |

**Frameworks**

- [React](#react-1)
- [Angular](#angular-1)
- [Vue](#vue-1)
- [Web Components](#web-components-1)

#### React

```js
import {
	AmplifyAuthenticator,
	AmplifySignIn,
	AmplifySignUp,
} from '@aws-amplify/ui-react';

const App = () => {
	<AmplifyAuthenticator>
		<AmplifySignIn headerText="My Custom Sign In Header" slot="sign-in" />
		<AmplifySignUp headerText="My Custom Sign Up Header" slot="sign-up" />

		<div>
			My App
			<AmplifySignOut />
		</div>
	</AmplifyAuthenticator>;
};
```

Alternatively, you can use the `withAuthenticator` higher-order component (HoC):

```js
import { withAuthenticator } from '@aws-amplify/ui-react';

...

export default withAuthenticator(App);
// or
export default withAuthenticator(App, { /* ...amplifyAuthenticatorSettings */ })
});
```

#### Angular

```html
<amplify-authenticator>
	<amplify-sign-in header-text="My Custom Sign In Header" slot="sign-in" />
	<amplify-sign-up header-text="My Custom Sign In Header" slot="sign-up" />

	<div>
		My App
		<amplify-sign-out></amplify-sign-out>
	</div>
</amplify-authenticator>
```

#### Vue

```html
<amplify-authenticator>
	<amplify-sign-in header-text="My Custom Sign In Header" slot="sign-in" />
	<amplify-sign-up header-text="My Custom Sign In Header" slot="sign-up" />

	<div>
		My App
		<amplify-sign-out></amplify-sign-out>
	</div>
</amplify-authenticator>
```

#### Web Components

```html
<amplify-authenticator>
	<amplify-sign-in header-text="My Custom Sign In Header" slot="sign-in" />
	<amplify-sign-up header-text="My Custom Sign In Header" slot="sign-up" />

	<div>
		My App
		<amplify-sign-out></amplify-sign-out>
	</div>
</amplify-authenticator>
```

## Theming

Theming for the UI components can be achieved by using [CSS Variables](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties). You can enable theming in your app by overriding the below mentioned CSS variable values. To do that, add the following code in root css file.

```
:root{

  --amplify-primary-color: #ff6347;
  --amplify-primary-tint: #ff7359;
  --amplify-primary-shade: #e0573e;

  }

```

### Supported CSS Custom properties

#### For Typography

| Custom Properties       | Default Value                                                                                |
| ----------------------- | -------------------------------------------------------------------------------------------- |
| `--amplify-font-family` | 'Amazon Ember', 'Helvetica Neue Light', 'Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif' |
| `--amplify-text-xxs`    | 0.75rem                                                                                      |
| `--amplify-text-xs`     | 0.81rem                                                                                      |
| `--amplify-text-sm`     | 0.875rem                                                                                     |
| `--amplify-text-md`     | 1rem                                                                                         |
| `--amplify-text-lg`     | 1.5rem                                                                                       |
| `--amplify-text-xl`     | 2rem                                                                                         |
| `--amplify-text-xxl`    | 2.5rem                                                                                       |

#### For Colors

| Custom Properties              | Default Value        |
| ------------------------------ | -------------------- |
| `--amplify-primary-color`      | #ff9900              |
| `--amplify-primary-contrast`   | var(--amplify-white) |
| `--amplify-primary-tint`       | #ffac31              |
| `--amplify-primary-shade`      | #e88b01              |
| `--amplify-secondary-color`    | #152939              |
| `--amplify-secondary-contrast` | var(--amplify-white) |
| `--amplify-secondary-tint`     | #31465f              |
| `--amplify-secondary-shade`    | #1F2A37              |
| `--amplify-tertiary-color`     | #5d8aff              |
| `--amplify-tertiary-contrast`  | var(--amplify-white) |
| `--amplify-tertiary-tint`      | #7da1ff              |
| `--amplify-tertiary-shade`     | #537BE5              |
| `--amplify-grey`               | #828282              |
| `--amplify-light-grey`         | #c4c4c4              |
| `--amplify-white`              | #ffffff              |
| `--amplify-red`                | #dd3f5b              |
| `--amplify-blue`               | #099ac8              |

## Amplify Authenticator `usernameAlias`

The `amplify-authenticator` component has the ability to sign in or sign up with `email` or `phone_number` instead of default `username`. To achieve this, you first need to setup the userpool to allow email or phone number as the username [using the cli workflow](https://aws-amplify.github.io/docs/cli-toolchain/quickstart#configuring-auth-without-social-providers) or through the [Cognito Console](https://docs.aws.amazon.com/cognito/latest/developerguide/user-pool-settings-attributes.html#user-pool-settings-aliases-settings-option-2). To reflect this in the `amplify-authenticator` component, you can use the `usernameAlias` property. It can take one of the three values - `email`, `phone_number` or `username`. Default is set to `username`.

**Usage:**

```js
// react
<AmplifyAuthenticator usernameAlias="email" />

// angular, vue or web components
<amplify-authenticator username-alias="phone_number" />
```

## Amplify Authenticator `federated`

The `amplify-authenticator` component supports Federated Sign In through Cognito Identity Pools (IDP) with external providers like Amazon, Auth0, Facebook, & Google.

The `federated` prop implements the `FederatedConfig`:

```ts
export interface FederatedConfig {
	auth0Config?: {
		audience?: string;
		clientID: string;
		domain: string;
		responseType: string;
		redirectUri: string;
		returnTo?: string;
		scope?: string;
	};
	amazonClientId?: string;
	facebookAppId?: string;
	googleClientId?: string;
	oauthConfig?: {
		[key: string]: any;
	};
}
```

**Usage:**

```js
const federated = {
  amazonClientId: "your_amazon_client_id",
  facebookAppId: "your_facebook_app_id",
  googleClientId: "your_google_client_id",
  oauthConfig: {
    redirectSignIn: "http://localhost:1234/",
    redirectSignOut: "http://localhost:1234/",
  }
}

// react
<AmplifyAuthenticator federated={federated} />

// angular, vue, or web components
<amplify-authenticator federated={federated} />
```

## Migration Guide

- [React](#react-2)
- [Angular](#angular-2)
- [Vue](#vue-2)
- [Web Components](#web-components-2)

#### React

##### Installation

```diff
- yarn add aws-amplify-react
+ yarn add @aws-amplify/ui-react
```

##### Usage

```diff
- import { Authenticator } from 'aws-amplify-react';
+ import { AmplifyAuthenticator } from '@aws-amplify/ui-react';

const App = () => (

+ <AmplifyAuthenticator>
- <Authenticator>
    <div>
      My App
+     <AmplifySignOut />
    </div>
+ </AmplifyAuthenticator>;
- </Authenticator>
);
```

If you're using the [`withAuthenticator`](https://aws-amplify.github.io/docs/js/authentication#using-withauthenticator-hoc) higher-order component (HoC):

```diff
- import { withAuthenticator } from 'aws-amplify-react';
+ import { withAuthenticator } from '@aws-amplify/ui-react';

...

export default withAuthenticator(App);
```

**Note:** If you were providing additional options to `withAuthenticator` (e.g. `includeGreetings`, `authenticatorComponents`, `federated`, `theme`), these have changed:

> [amplify-authenticator#properties](src/components/amplify-authenticator/readme.md#properties)

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
import { AppComponent } from './app.component';
- import { AmplifyAngularModule, AmplifyService } from 'aws-amplify-angular';
+ import { AmplifyUIAngularModule } from '@aws-amplify/ui-angular';
import Amplify from 'aws-amplify';
import awsconfig from './aws-exports';

Amplify.configure(awsconfig);

@NgModule({
  declarations: [AppComponent],
- imports: [AmplifyAngularModule, BrowserModule],
+ imports: [AmplifyUIAngularModule, BrowserModule],
- providers: [AmplifyService],
+ providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
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
import App from "./App.vue";
- import Amplify, * as AmplifyModules from 'aws-amplify'
- import { AmplifyPlugin } from 'aws-amplify-vue'
+ import '@aws-amplify/ui-vue';
+ import Amplify from 'aws-amplify';
+ import awsconfig from './aws-exports';

Amplify.configure(awsconfig);

new Vue({
  render: h => h(App),
}).$mount('#app');
```

---

![Built With Stencil](https://img.shields.io/badge/-Built%20With%20Stencil-16161d.svg?logo=data%3Aimage%2Fsvg%2Bxml%3Bbase64%2CPD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDE5LjIuMSwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IgoJIHZpZXdCb3g9IjAgMCA1MTIgNTEyIiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA1MTIgNTEyOyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI%2BCjxzdHlsZSB0eXBlPSJ0ZXh0L2NzcyI%2BCgkuc3Qwe2ZpbGw6I0ZGRkZGRjt9Cjwvc3R5bGU%2BCjxwYXRoIGNsYXNzPSJzdDAiIGQ9Ik00MjQuNywzNzMuOWMwLDM3LjYtNTUuMSw2OC42LTkyLjcsNjguNkgxODAuNGMtMzcuOSwwLTkyLjctMzAuNy05Mi43LTY4LjZ2LTMuNmgzMzYuOVYzNzMuOXoiLz4KPHBhdGggY2xhc3M9InN0MCIgZD0iTTQyNC43LDI5Mi4xSDE4MC40Yy0zNy42LDAtOTIuNy0zMS05Mi43LTY4LjZ2LTMuNkgzMzJjMzcuNiwwLDkyLjcsMzEsOTIuNyw2OC42VjI5Mi4xeiIvPgo8cGF0aCBjbGFzcz0ic3QwIiBkPSJNNDI0LjcsMTQxLjdIODcuN3YtMy42YzAtMzcuNiw1NC44LTY4LjYsOTIuNy02OC42SDMzMmMzNy45LDAsOTIuNywzMC43LDkyLjcsNjguNlYxNDEuN3oiLz4KPC9zdmc%2BCg%3D%3D&colorA=16161d&style=flat-square)
