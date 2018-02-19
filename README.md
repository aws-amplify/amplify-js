# AWS Amplify

<a href="https://nodei.co/npm/aws-amplify/">
  <img src="https://nodei.co/npm/aws-amplify.svg?downloads=true&downloadRank=true&stars=true">
</a>
<p>
  <a href="https://gitter.im/AWS-Amplify/Lobby?utm_source=share-link&utm_medium=link&utm_campaign=share-link" target="_blank">
    <img src="https://badges.gitter.im/aws/aws-amplify.png" alt="Gitter Chat" />  
  </a>
  <a href="https://badge.fury.io/js/aws-amplify">
    <img src="https://badge.fury.io/js/aws-amplify.svg" alt="npm version" height="18">
  </a>
  <a href="https://npmjs.org/aws-amplify">
    <img src="https://img.shields.io/npm/dm/aws-amplify.svg" alt="npm downloads" height="18">
  </a>
  <a href="https://travis-ci.org/aws/aws-amplify">
    <img src="https://travis-ci.org/aws/aws-amplify.svg?branch=master" alt="build:started">
  </a>
  <a href="https://codecov.io/gh/aws/aws-amplify">
    <img src="https://codecov.io/gh/aws/aws-amplify/branch/master/graph/badge.svg" />
  </a>
</p>

AWS Amplify is a JavaScript library for frontend and mobile developers building cloud-enabled applications. The library is a declarative interface across different categories of operations in order to make common tasks easier to add into your application. The default implementation works with Amazon Web Services (AWS) resources but is designed to be open and pluggable for usage with other cloud services that wish to provide an implementation or custom backends.

<img src="https://dha4w82d62smt.cloudfront.net/items/1z3c0R3C3R1M063M3g2D/Screen%20Recording%202018-02-11%20at%2009.02%20AM.gif" style="display: block;height: auto;width: 100%;"/>

* [Installation](#installation)
  - [Web Development](#web-development)
  - [React Native Development](#react-native-development)
* [Documentation](https://aws.github.io/aws-amplify)
* [Examples](#example)
  - [1. Collect user session metrics.](#1-collect-user-session-metrics)
  - [2. Add Authentication](#2-add-authentication-to-your-app)
  - [3. Override default authentication screens](#3-override-default-authentication-screens)
  - [4. Sign HTTP requests](#4-sign-http-requests)
  - [5. Upload and Download public or private content](#5-upload-and-download-public-or-private-content)
* [Contributing](#contributing)

## Installation

### Web Development
AWS Amplify is available as the `aws-amplify` package on [npm](https://www.npmjs.com/)

```
$ npm install aws-amplify --save
```

If you are developing a [React](https://github.com/facebook/react/) app, you can install an additional package `aws-amplify-react` containing [Higher Order Components](https://reactjs.org/docs/higher-order-components.html):

```
$ npm install aws-amplify-react --save
```

### React Native Development

For React Native development, install `aws-amplify` 

```bash
$ npm install aws-amplify --save
```

If you are developing a [React Native](https://github.com/facebook/react-native) app, you can install an additional package `aws-amplify-react-native` containing [Higher Order Components](https://reactjs.org/docs/higher-order-components.html):

```bash
$ npm install aws-amplify-react-native --save
```

Unless your react-native app was created using [Expo v25.0.0 or greater](https://blog.expo.io/expo-sdk-v25-0-0-is-now-available-714d10a8c3f7), you will need to [link](https://facebook.github.io/react-native/docs/linking-libraries-ios.html) libraries in your project for the Auth module on React Native.

To link `amazon-cognito-identity-js`, you must first `eject` the project:

```bash
$ npm run eject
$ react-native link amazon-cognito-identity-js
```

Now run your application as normal:

```bash
$ react-native run-ios
```

Documentation is available [here](https://aws.github.io/aws-amplify)

## Examples

AWS Amplify supports many category scenarios such as Auth, Analytics, APIs and Storage as outlined in the [Developer Guide](docs/media/developer_guide.md). A couple of samples are below. For in-depth samples with specific frameworks:

 - [React](https://github.com/awslabs/aws-mobile-react-sample)
 - [React Native](https://github.com/awslabs/aws-mobile-react-native-starter)
 - [Ionic](https://github.com/ionic-team/starters/tree/master/ionic-angular/official/aws)
 - Vue (coming soon)
 - Angular (coming soon)

### 1. Collect user session metrics

By default, AWS Amplify can send user session information as metrics with a few lines of code:

```js
import Amplify, { Analytics } from 'aws-amplify';
import aws_exports from './aws-exports';

Amplify.configure(aws_exports);
...
Analytics.record('myCustomEvent');
```

See [here](https://aws.github.io/aws-amplify/media/analytics_guide.html) for the Analytics developer guide. 

### 2. Add Authentication to your App

<img src="https://dha4w82d62smt.cloudfront.net/items/2R3r0P453o2s2c2f3W2O/Screen%20Recording%202018-02-11%20at%2003.48%20PM.gif" style="display: block;height: auto;width: 100%;"/>

Take a fresh React app created by `create-react-app` as an example and edit the `App.js` file:

```jsx
import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

import Amplify from 'aws-amplify';
import { withAuthenticator } from 'aws-amplify-react';
import aws_exports from './aws-exports';

Amplify.configure(aws_exports);

class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>
        <p className="App-intro">
          To get started, edit <code>src/App.js</code> and save to reload.
        </p>
      </div>
    );
  }
}

export default withAuthenticator(App);
```

If you are working in React Native the exact same setup is used. Simply include `aws-amplify-react-native` instead:

```jsx
...
import Amplify from 'aws-amplify';
import { withAuthenticator } from 'aws-amplify-react-native';
import aws_exports from './aws-exports';
Amplify.configure(aws_exports);

...

export default withAuthenticator(App);
```

### 3. Override default authentication screens

The `withAuthenticator` HOC gives you some good default authentication screens. But if you need to
customize those screens with more than simply styles, it also provides an optional third parameter
through which you can pass the list of customized (or not) screens:

```js
import React, { Component } from 'react';
import { ConfirmSignIn, ConfirmSignUp, ForgotPassword, SignIn, SignUp, VerifyContact, withAuthenticator } from 'aws-amplify-react';

class App extends Component {
  render() {
    ...
  }
}

class MySignIn extends SignIn {
  render() {
    ...
  }
}

export default withAuthenticator(App, false, [
  <MySignIn/>,
  <ConfirmSignIn/>,
  <VerifyContact/>,
  <SignUp/>,
  <ConfirmSignUp/>,
  <ForgotPassword/>
]);

```

### 4. Sign HTTP requests

Sign REST requests with [AWS Signature Version 4](http://docs.aws.amazon.com/general/latest/gr/signature-version-4.html) using the API module to one or multiple endpoints:

```js
let apiName = 'MyApiName';
let path = '/path'; 
let options = {
    headers: {...} // OPTIONAL
}
API.get(apiName, path, options).then(response => {
    // Add your code here
});
```

### 5. Upload and Download public or private content

With configurable settings, store content in an S3 bucket in public folders for all of your application's users or in private folders for each user identity:

```js
  Storage.put(key, fileObj, {level: 'private'})
        .then (result => console.log(result))
        .catch(err => console.log(err));
        
    // Stores data with specifying its MIME type
    Storage.put(key, fileObj, {
        level: 'private',
        contentType: 'text/plain'
    })
    .then (result => console.log(result))
    .catch(err => console.log(err));
```

## Contributing

See [Contributing Guidelines](https://github.com/aws/aws-amplify/blob/master/CONTRIBUTING.md)
