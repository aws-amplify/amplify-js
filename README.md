# AWS Amplify

AWS Amplify is a JavaScript library for Frontend and mobile developers building cloud-enabled applications. The library is a declaritive interface across different categories of operations in order to make common tasks easier to add into your application. The default implementation works with Amazon Web Services (AWS) resources but is designed to be open and pluggable for usage with other cloud services that wish to provide an implementation or custom backends.

* [Installation](#installation)
  - [Web Development](#web-development)
  - [React Native Development](#react-native-development)
* [Documentation](#documentation)
* [Example](#example)
  - [1. Collect user session metrics.](#1-collect-user-session-metrics)
  - [2. Bind app with Authentications](#2-bind-app-with-authentications)

## Installation

### Web Development
AWS Amplify is available as the `aws-amplify` package on [npm](https://www.npmjs.com/)
```
npm install aws-amplify
```

If you are developing a [React](https://github.com/facebook/react/) app, you can install an additional package `aws-amplify-react` containing [Higher Order Components](https://reactjs.org/docs/higher-order-components.html):
```
npm install aws-amplify-react
```

### React Native Development

For React Native development, install `aws-amplify-react-native` instead of `aws-amplify`
```
npm install aws-amplify-react-native
```

## Documentation

* [Quick Start](media/quick_start.md)
* [Developer Guide](media/developer_guide.md)
* [API Reference](media/api_reference.md)

## Example

### 1. Collect user session metrics

By default AWS Amplify can send

```
import Amplify, { Analytics } from 'aws-amplify';
import aws_exports from './aws-exports';

Amplify.configure(aws_exports);
```

### 2. Bind app with Authentications
Take a fresh React app created by `create-react-app` as an example.

App.js
```
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
