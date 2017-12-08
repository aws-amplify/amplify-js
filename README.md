# AWS Amplify

<a href="https://nodei.co/npm/aws-amplify/">
  <img src="https://nodei.co/npm/aws-amplify.svg?downloads=true&downloadRank=true&stars=true">
</a>

<p>
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

For React Native development, install `aws-amplify-react-native` instead of `aws-amplify`

```
npm install aws-amplify-react-native --save
```

You will need to [link](https://facebook.github.io/react-native/docs/linking-libraries-ios.html) libraries in your project for the Auth module on React Native. Follow the instructions [here](https://github.com/aws/aws-amplify/blob/master/media/quick_start.md#react-native-development).

## Documentation

* [Quick Start](media/quick_start.md)
* [API Reference](media/api_reference.md)
* [Developer Guide](media/developer_guide.md)
  * [Installation and Configuration](media/install_n_config.md)
  * [Authentication](media/authentication_guide.md)
  * [Analytics](media/analytics_guide.md)
  * [API](media/api_guide.md)
  * [Storage](media/storage_guide.md)
  * [Cache](media/cache_guide.md)
  * Utilities
    - [I18n](media/i18n_guide.md)
    - [Logger](media/logger_guide.md)
    - [Hub](media/hub_guide.md)

## Examples

AWS Amplify supports many category scenarios such as Auth, Analytics, APIs and Storage as outlined in the [Developer Guide](media/developer_guide.md). A couple of samples are below.

### 1. Collect user session metrics

By default, AWS Amplify can send user session information as metrics with a few lines of code:

```js
import Amplify, { Analytics } from 'aws-amplify';
import aws_exports from './aws-exports';

Amplify.configure(aws_exports);
```

### 2. Add Authentication to your App
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

### 3. Sign HTTP requests

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

### 4. Upload and Download public or private content

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
