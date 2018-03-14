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

### AWS Amplify is a JavaScript library for frontend and mobile developers building cloud-enabled applications. 

AWS Amplify provides a declarative and easy-to-use interface across different categories of cloud operations. AWS Amplify goes well with any JavaScript based frontend workflow, and React Native for mobile developers. Our default implementation works with Amazon Web Services (AWS), but AWS Amplify is designed to be open and pluggable for any custom backend or service.

#### Visit our [Web Site](https://aws.github.io/aws-amplify) to learn more about AWS Amplify.

<img src="https://dha4w82d62smt.cloudfront.net/items/1z3c0R3C3R1M063M3g2D/Screen%20Recording%202018-02-11%20at%2009.02%20AM.gif" style="display: block;height: auto;width: 100%;"/>

* [Installation](#installation)
  - [Web Development](#web-development)
  - [React Native Development](#react-native-development)
* [Documentation](https://aws.github.io/aws-amplify)
* [Examples](#example)
  - [1. Collect user session metrics.](#1-collect-user-session-metrics)
  - [2. Add Authentication](#2-add-authentication-to-your-app)
  - [3. Sign HTTP requests](#4-sign-http-requests)
  - [4. Upload and Download public or private content](#5-upload-and-download-public-or-private-content)
* [Contributing](#contributing)

## Installation

### Web Development

For creating cloud powered Web apps with JavaScript, AWS Amplify is available as `aws-amplify` package on [npm](https://www.npmjs.com/)

```
$ npm install aws-amplify --save
```

If you are developing a [React](https://github.com/facebook/react/) app, you can install an additional package `aws-amplify-react` containing [Higher Order Components](https://reactjs.org/docs/higher-order-components.html):

```
$ npm install aws-amplify-react --save
```
#### Visit our [Installation Guide for Web](https://aws.github.io/aws-amplify/media/install_n_config?platform=javascript) to start building your web app.  

### React Native Development

For React Native development, install `aws-amplify` 

```bash
$ npm install aws-amplify --save
```

If you are developing a [React Native](https://github.com/facebook/react-native) app, you can install an additional package `aws-amplify-react-native` containing [Higher Order Components](https://reactjs.org/docs/higher-order-components.html):

```bash
$ npm install aws-amplify-react-native --save
```

#### Visit our [Installation Guide for React Native](https://aws.github.io/aws-amplify/media/install_n_config?platform=react-native) to start building your web app.  

## Examples

AWS Amplify supports many category scenarios such as Auth, Analytics, APIs and Storage as outlined in the [Developer Guide](https://aws.github.io/aws-amplify/media/developer_guide). A couple of samples are below:

### 1. Collect user session metrics

By default, AWS Amplify can collect user session tracking data with a few lines of code:

```js
import Amplify, { Analytics } from 'aws-amplify';
import aws_exports from './aws-exports';

Amplify.configure(aws_exports);
...
Analytics.record('myCustomEvent');
```

#### See our [Analytics Developer Guide](https://aws.github.io/aws-amplify/media/analytics_guide.html) for detailed information. 

### 2. Add Authentication to your App

Adding authentication to your React Native app is as easy as wrapping your app's main component with our `withAuthenticator` higher order component. AWS Amplify will provide you customizable UI for common use cases such as user registration and login.

```jsx
...
import Amplify from 'aws-amplify';
import { withAuthenticator } from 'aws-amplify-react-native';
import aws_exports from './aws-exports';
Amplify.configure(aws_exports);

...

export default withAuthenticator(App);
```

#### See our [Authentication Developer Guide](https://aws.github.io/aws-amplify/media/authentication_guide) for detailed information. 

### 3. Sign HTTP requests

AWS Amplify automatically signs your REST requests with [AWS Signature Version 4](http://docs.aws.amazon.com/general/latest/gr/signature-version-4.html) when using the API module :

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

#### See our [API Developer Guide](https://aws.github.io/aws-amplify/media/api_guide) for detailed information. 

### 4. Upload and Download public or private content

AWS Amplify provides an easy-to-use API to store and get content from public or private storage folders:  

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

#### See our [Storage Developer Guide](https://aws.github.io/aws-amplify/media/storage_guide) for detailed information. 

## Contributing

See [Contributing Guidelines](https://github.com/aws/aws-amplify/blob/master/CONTRIBUTING.md)
