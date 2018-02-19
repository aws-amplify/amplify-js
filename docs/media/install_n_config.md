# Installation and Configuration

* [Installation](#installation)
* [Configuration](#configuration)
  - [Automated Setup](#automated-setup)
  - [Manual Setup](#manual-setup)

## Installation

For React Native and Web development, regardless of framework, `aws-amplify` provides core APIs

```bash
npm install aws-amplify
```

On React app, there are helper and higher order components are packaged in `aws-amplify-react`

```bash
npm install aws-amplify-react
```

Similarly with React Native in `aws-amplify-react-native`

```bash
npm install aws-amplify-react-native
```

**If you are not using `create-react-native-app` or Expo SDK 25+** you will need to [link](https://facebook.github.io/react-native/docs/linking-libraries-ios.html) libraries in your project for the Auth module on React Native. Follow the instructions [here](https://github.com/aws/aws-amplify/blob/master/media/quick_start.md#react-native-development).

## Configuration

You are required to pass in an Amazon Cognito Identity Pool ID, allowing the library to retrieve base credentials for a user even in an UnAuthenticated state. You can configure it by yourself or let [AWS Mobile Hub do it for you](#automated-setup).

Note: If using Mobile Hub, ensure that user sign-in is set to optional in your app. To do so, go your project on [AWS Mobile Hub console](https://console.aws.amazon.com/mobilehub/home.html#/) and click on your project, and then click on the **User Sign-in** tile. Verify that **Optional**
button is selected in the options for Sign-In required.

### Automated Setup

You can use the [awsmobile-cli](https://github.com/aws/awsmobile-cli) to automatically boostrap your AWS backend:

```
$ npm install -g awsmobile-cli
$ cd my-app
$ awsmobile init
$ awsmobile features    # select the features you would like to enable
$ awsmobile push        # update the backend
```

Choose the features you would like to enable i.e. user-signin for authentication and your project will automatically be updated with an updated `aws-exports.js` file containing the configuration for those features. Then, within your app:

```js
import Amplify from 'aws-amplify';
import aws_exports from './aws-exports'

Amplify.configure(aws_exports);
```

### Manual Setup

At the top of your application entry point, add in the following code to configure the library:

```js
import Amplify from 'aws-amplify';

Amplify.configure({
    Auth: {
    // REQUIRED - Amazon Cognito Identity Pool ID
        identityPoolId: 'XX-XXXX-X:XXXXXXXX-XXXX-1234-abcd-1234567890ab', 
    // REQUIRED - Amazon Cognito Region    
        region: 'XX-XXXX-X', 
    // OPTIONAL - Amazon Cognito User Pool ID
        userPoolId: 'XX-XXXX-X_abcd1234', 
    // OPTIONAL - Amazon Cognito App Client ID
        userPoolWebClientId: 'a1b2c3d4e5f6g7h8i9j0k1l2m3', // 26-char alphanumeric string 
    }
});
```

The above configuration requires an Amazon Cognito Identity Pool ID so that the library can retrieve base credentials for a user even in an UnAuthenticated state. You will also need to include Amazon Cognito User Pool ID and Web Client ID.

[Amazon Cognito Identity](http://docs.aws.amazon.com/cognito/latest/developerguide/getting-started-with-identity-pools.html)

[Amazon Cognito User Pools](http://docs.aws.amazon.com/cognito/latest/developerguide/getting-started-with-cognito-user-pools.html)

