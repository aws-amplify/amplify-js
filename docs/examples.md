---
layout: default
title: Examples 
---

## Examples

AWS Amplify supports many category scenarios such as Auth, Analytics, APIs and Storage as outlined in the [Developer Guide](docs/media/developer_guide.md). A couple of samples are below. 

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