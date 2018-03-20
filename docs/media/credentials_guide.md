# Credentials

AWS Amplify Credentials module helps you manage credentials. This module is basically decoupled from Auth module. Other modules like API, Analytics, Storage will retrieve credentials from this module and Auth module will provide essential info to setup credentials.

* [Installation and Configuration](#installation-and-configuration)
  - [Automated Setup](#automated-setup)
  - [Manual Setup](#manual-setup)
* [Integration](#integration)
  - [1. Set Credentials](#1-set-credentials)
  - [2. Get Credentials](#2-get-credentials)
  - [3. Remove Credentials](#3-remove-credentials)
  - [4. Get Current Session](#4-get-current-session)

## Installation and Configuration

Please refer to this [Guide](install_n_config.md) for general setup. Here are Credentials specific setup.

### Automated Setup

To create a project fully functioning with the Analytics category.

```
$ npm install -g awsmobile-cli
$ cd my-app
$ awsmobile init
$ awsmobile enable user-signin
$ awsmobile push
```

In your project i.e. App.js:

```
import Amplify, { Credentials } from 'aws-amplify';
import aws_exports from './aws-exports';
Amplify.configure(aws_exports);
```

### Manual Setup

```js
import Amplify from 'aws-amplify';

Amplify.configure({
    Credentials: {
        cognitoIdentityPoolId: 'XXXXXXXXXXXXX',
        cognitoRegion: 'XXXXXXXXXXXXX',
        cognitoUserPoolId: 'XXXXXXXXXXXXXXX',
        mandatorySignIn: false
    } 
});

```

## Integration

### 1. Set Credentials

When using AWS Cognito service, the credentials will be automatically setup.

### 2. Get Credentials

To get the current credential

```js
import { Credentials } from 'aws-amplify';

Credentials.getCredentials().then((credentials) => {
    console.log(credentials);
});
```

### 3. Remove Credentials

Amplify will remove all the credentials when user signs out.
You can call it manually by:

```js
import { Credentials } from 'aws-amplify';

Credentials.removeCredentials();
```

### 4. Get Current Session

To get the current cognito session. Note that this call only works when you signed in with AWS Cognito User Pool.

```js
import { Credentials } from 'aws-amplify';

Credentials.currentSession().then(session => {
    console.log(session);
});
```
