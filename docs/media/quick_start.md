# Quick Start
AWS Amplify is not limited to AWS or React. The library is designed to support different contributions across categories for alternative implementations, both on the Cloud interactions as well as the JavaScript framework components. However, there are React & React Native specific extensions that can be leveraged. Additionally, we showcase the usage with AWS resources to streamline getting started.

* [Installation & Configuration](#installation)
* [Analytics](#analytics)
* [Authentication](#authentication)
* [AWS Services](#aws-services)
* [React Native Development](#react-native-development)

You can begin with an existing React application. Otherwise, please use  [Create React App](https://github.com/facebookincubator/create-react-app).

```bash
create-react-app amplify-start
cd amplify-start
npm start
```

You should see a basic React application running in your browser.

## Install Amplify 
AWS Amplify is available as an npm package. Run the following from the current directory of your application:
```bash
npm install aws-amplify
npm install aws-amplify-react    # not required but contains higher order components
```

To setup a new or existing AWS Mobile Hub project you can use the [awsmobile-cli](https://github.com/aws/awsmobile-cli).

```bash
$ npm install -g awsmobile-cli
$ cd my-app
$ awsmobile init <optional-mobile-hub-project-id-for-existing-projects>
```

### Automated Setup

At the entry point of your application (typically `App.js` for a React application) add in the following code before your first [Component](https://reactjs.org/docs/components-and-props.html) in order to configure the library.

You can use the [awsmobile-cli](https://github.com/aws/awsmobile-cli) to automatically boostrap your AWS backend:

```
$ npm install -g awsmobile-cli
$ cd my-app
$ awsmobile init        # initialize a new AWS Mobile Hub project
$ awsmobile features    # select your features
$ awsmobile push        # update your AWS backend
```

Choose the features you would like to enable i.e. user-signin for authentication and your project will automatically be updated with an `aws-exports.js` file inside your source code directory containing the configuration for those features. Then, within your app (App.js or similar) simply import the file and pass it as the configuration to the Amplify:

```js
import Amplify from 'aws-amplify';
import aws_exports from './aws-exports';

Amplify.configure(aws_exports);
```

### Manual Setup

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
    // OPTIONAL - Amazon Cognito Web Client ID
        userPoolWebClientId: 'XX-XXXX-X_abcd1234', 
    }
});
```

In the above configuration you are required to pass in an Amazon Cognito Identity Pool ID so that the library can retrieve base credentials for a user even in an UnAuthenticated state. If you wish to you can leverage existing AWS resources by manually setting up the Services listed below:

[Amazon Cognito Identity](http://docs.aws.amazon.com/cognito/latest/developerguide/getting-started-with-identity-pools.html)

[Amazon Cognito User Pools](http://docs.aws.amazon.com/cognito/latest/developerguide/getting-started-with-cognito-user-pools.html)

[Amazon Pinpoint](http://docs.aws.amazon.com/pinpoint/latest/developerguide/getting-started.html)


After configuration, user session metrics are automatically collected and sent to Amazon Pinpoint. To see these metrics click [here](https://console.aws.amazon.com/pinpoint/home/), or on the cli (from your project directory):

```
$ awsmobile console
```

## Analytics

Now that you've got basic tracking for user sessions, you may wish to add additional metrics for analytics recording in your application. Open `/src/App.js`, add two lines of code.

```js
import { Analytics } from 'aws-amplify';

...
    render() {
        Analytics.record('appRender');
...
```

This will record an **appRender** event every time user opens app.

For more about Analytics, click [here](analytics_guide.md)

## Authentication

In your `App.js`, add one import and wrap your default component export as seen below:
```js
import { withAuthenticator } from 'aws-amplify-react';

...

export default withAuthenticator(App);
```

This will gate the entire application inside an Authentication UI. Only signed in user have access to use your application's features.

<img src="https://dha4w82d62smt.cloudfront.net/items/2R3r0P453o2s2c2f3W2O/Screen%20Recording%202018-02-11%20at%2003.48%20PM.gif" style="display: block;height: auto;width: 100%;"/>

For more about Authenticator, click [here](authentication_guide.md)

## AWS Services

You can call methods on any AWS Service by passing in your credentials from auth to the service call constructor:

```js
Auth.currentCredentials()
  .then(credentials => {
    const route53 = new Route53({
      apiVersion: '2013-04-01',
      credentials: Auth.essentialCredentials(credentials)
    });

    // more code working with route53 object
    // route53.changeResourceRecordSets();
  })
```

Note: your Amazon Cognito users' [IAM role](https://docs.aws.amazon.com/cognito/latest/developerguide/iam-roles.html) must have the appropriate permissions to call the requested services.

Full API Documentation is available <a href="https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/_index.html" target="_blank">here</a>.

## React Native Development

AWS Amplify is available as an npm package and supports both web and React Native core APIs. Run the following from the current directory of your application:
```bash
$ npm install aws-amplify
$ npm install aws-amplify-react-native
```

**Create React Native App**

With CRNA (create-react-native-app), you do not need to link native libraries for Amazon Cognito, they are built into the Expo SDK 25+. 

```bash
npm install -g create-react-native-app
$ create-react-native-app myAmplifyProject
$ cd myAmplifyProject
```

Note: project name is in camelCase to avoid problems when testing on a physical iOS phone.

**Install AWS Amplify**

```bash
$ npm install aws-amplify --save
$ npm install aws-amplify-react-native --save
```

Unless your react-native app was created using [Expo v25.0.0 or greater](https://blog.expo.io/expo-sdk-v25-0-0-is-now-available-714d10a8c3f7), you will need to [link](https://facebook.github.io/react-native/docs/linking-libraries-ios.html) libraries in your project for the Auth module on React Native.

```bash
$ react-native init myReactNativeApp
$ cd myReactNativeApp
$ npm install --save aws-amplify
$ npm install --save aws-amplify-react-native
$ react-native link amazon-cognito-identity-js
```

Then run your app:

```bash
$ react-native run-ios  # or run-android
```

**Configuration**

At the entry point of your application (typically `App.js` for a React application) add in the following code before your first [Component](https://reactjs.org/docs/components-and-props.html) in order to configure the library. You can configure the library using the `aws-exports.js` file on your [AWS Mobile Hub](https://console.aws.amazon.com/mobilehub/home) project. 

```bash
$ npm install -g awsmobile-cli
$ cd my-app
$ awsmobile init <optional-mobile-hub-project-id-for-existing-projects>
```

This will create a new `awsmobilejs` folder in your project that contains your backend configuration. You can enable more features with `awsmobile features` and update your backend with `awsmobile push`. An `aws-exports.js` will be maintained in your `src` directory which you can import and use to configure Amplify.

```js
import Amplify from 'aws-amplify';
import aws_exports from './aws-exports';

Amplify.configure(aws_exports);

```

Without the CLI, you can also manually configure Amplify:

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
    // OPTIONAL - Amazon Cognito Web Client ID
        userPoolWebClientId: 'XX-XXXX-X_abcd1234',
    }
});
```

**Include Authenticator**

Modify `App.js`:

```js
...
import { withAuthenticator } from 'aws-amplify-react-native';

class App extends React.Component {
...
}

export default withAuthenticator(App);
...
```

Reload your application on the physical phone or emulator/simulator:

<img src="react_native_with_authenticator.png" width="360px"/>
