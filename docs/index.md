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

* [Installation](#installation)
  - [Web Development](#web-development)
  - [React Native Development](#react-native-development)
* [Documentation](#documentation)
* [Examples](#example)
  - [1. Collect user session metrics.](#1-collect-user-session-metrics)
  - [2. Add Authentication](#2-add-authentication-to-your-app)
  - [3. Sign HTTP requests](#3-sign-http-requests)
  - [4. Upload and Download public or private content](#4-upload-and-download-public-or-private-content)
* [Contributing](#contributing)

## Installation

### Web Development
AWS Amplify is available as the `aws-amplify` package on [npm](https://www.npmjs.com/)

```
npm install aws-amplify --save
```

If you are developing a [React](https://github.com/facebook/react/) app, you can install an additional package `aws-amplify-react` containing [Higher Order Components](https://reactjs.org/docs/higher-order-components.html):

```
npm install aws-amplify-react --save
```

### React Native Development

For React Native development, install `aws-amplify` 
```
npm install aws-amplify --save
```
If you are developing a [React Native](https://github.com/facebook/react-native) app, you can install an additional package `aws-amplify-react-native` containing [Higher Order Components](https://reactjs.org/docs/higher-order-components.html):
```
npm install aws-amplify-react-native --save
```

Unless you're react-native app was created using [Expo v25.0.0 or greater](https://blog.expo.io/expo-sdk-v25-0-0-is-now-available-714d10a8c3f7), you will need to [link](https://facebook.github.io/react-native/docs/linking-libraries-ios.html) libraries in your project for the Auth module on React Native.

To link `amazon-cognito-identity-js`, you must first `eject` the project:

```bash
npm run eject
react-native link amazon-cognito-identity-js
```

Now run your application as normal:

```bash
react-native run-ios
```
