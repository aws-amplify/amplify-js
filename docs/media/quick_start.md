# Quick Start
AWS Amplify is not limited to AWS or React. The library is designed to support different contributions across categories for alternative implementations, both on the Cloud interactions as well as the JavaScript framework components. However, there are React & React Native specific extensions that can be leveraged. Additionally, we showcase the usage with AWS resources to streamline getting started.

* [Installation](#installation)
* [Configuration](#configuration)
* [More Analytics](#more-analytics)
* [Bind Authentications](#bind-authentications)
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
npm install aws-amplify-react
```

To setup a new or existing AWS Mobile Hub project you can use the [awsmobile-cli](https://github.com/aws/awsmobile-cli).

```bash
$ npm install -g awsmobile-cli
$ cd my-app
$ awsmobile init <optional-mobile-hub-project-id>
```

## Configuration

At the entry point of your application (typically `App.js` for a React application) add in the following code before your first [Component](https://reactjs.org/docs/components-and-props.html) in order to configure the library:

```js
import Amplify from 'aws-amplify';

Amplify.configure({
    Auth: {
        identityPoolId: 'XX-XXXX-X:XXXXXXXX-XXXX-1234-abcd-1234567890ab', //REQUIRED - Amazon Cognito Identity Pool ID
        region: 'XX-XXXX-X', // REQUIRED - Amazon Cognito Region
        userPoolId: 'XX-XXXX-X_abcd1234', //OPTIONAL - Amazon Cognito User Pool ID
        userPoolWebClientId: 'XX-XXXX-X_abcd1234', //OPTIONAL - Amazon Cognito Web Client ID
    },
    Analytics: {
        appId: 'XXXXXXXXXXabcdefghij1234567890ab', //OPTIONAL -  Amazon Pinpoint App ID
        region: 'XX-XXXX-X', //OPTIONAL -  Amazon service region
    }
});
```

In the above configuration you are required to pass in an Amazon Cognito Identity Pool ID so that the library can retrieve base credentials for a user even in an UnAuthenticated state. If you pass in properties in the Analytics section for Amazon Pinpoint the library will automatically track some base metrics for you without any extra effort. 

### Manual Setup

If you wish to you can leverage existing AWS resources by manually setting up the Services listed below:

[Amazon Cognito Identity](http://docs.aws.amazon.com/cognito/latest/developerguide/getting-started-with-identity-pools.html)

[Amazon Cognito User Pools](http://docs.aws.amazon.com/cognito/latest/developerguide/getting-started-with-cognito-user-pools.html)

[Amazon Pinpoint](http://docs.aws.amazon.com/pinpoint/latest/developerguide/getting-started.html)

Alternatively you can automate this process with a single button click outlined in the next section.

### Automated Setup

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

After configuration, user session metrics are automatically collected and sent to Amazon Pinpoint. To see these metrics click [here](https://console.aws.amazon.com/pinpoint/home/), or on the cli (from your project directory):

```
$ awsmobile console
```

## More Analytics

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

## Bind Authentications

In your `App.js`, add one import and wrap your default component export as seen below:
```js
import { withAuthenticator } from 'aws-amplify-react';

...

export default withAuthenticator(App);
```

This will gate the entire application inside an Authentication UI. Only signed in user have access to use your application's features.

<img src="sign_in.png" width="320px"/>

For more about Authenticator, click [here](authentication_guide.md)

## React Native Development

AWS Amplify is available as an npm package and supports both web and React Native core APIs. Run the following from the current directory of your application:
```bash
npm install aws-amplify
npm install aws-amplify-react-native
```

Second, authentication requires a native bridge for mathematical performance not available in the JavaScript runtime. As a result, you need to [Link Libraries](https://facebook.github.io/react-native/docs/linking-libraries-ios.html) to your project. The below steps outline how you can do this with a new React Native application:

**Create React Native App**

Follow steps [here](https://facebook.github.io/react-native/blog/2017/03/13/introducing-create-react-native-app.html)

```bash
npm i -g create-react-native-app
$ create-react-native-app myProject
$ cd myProject
$ npm start
```

Note: project name is in camelCase to avoid problems when testing on a physical iOS phone.

**Install AWS Amplify**

```bash
npm install aws-amplify --save
npm install aws-amplify-react-native --save
```

Unless your react-native app was created using [Expo v25.0.0 or greater](https://blog.expo.io/expo-sdk-v25-0-0-is-now-available-714d10a8c3f7), you will need to [link](https://facebook.github.io/react-native/docs/linking-libraries-ios.html) libraries in your project for the Auth module on React Native.

**React Native Link**

Now you can link `amazon-cognito-identity-js`, but first you must `eject` the project:

```bash
npm install
npm run eject
```

Answer a few questions and upon completion link the library:

```bash
react-native link amazon-cognito-identity-js
```

Now run your application as normal:

```bash
react-native run-ios
```

**Configuration**

At the entry point of your application (typically `App.js` for a React application) add in the following code before your first [Component](https://reactjs.org/docs/components-and-props.html) in order to configure the library:

```js
import Amplify from 'aws-amplify';

Amplify.configure({
    Auth: {
        identityPoolId: 'XX-XXXX-X:XXXXXXXX-XXXX-1234-abcd-1234567890ab', //REQUIRED - Amazon Cognito Identity Pool ID
        region: 'XX-XXXX-X', // REQUIRED - Amazon Cognito Region
        userPoolId: 'XX-XXXX-X_abcd1234', //OPTIONAL - Amazon Cognito User Pool ID
        userPoolWebClientId: 'XX-XXXX-X_abcd1234', //OPTIONAL - Amazon Cognito Web Client ID
    },
    Analytics: {
        appId: 'XXXXXXXXXXabcdefghij1234567890ab', //OPTIONAL -  Amazon Pinpoint App ID
        region: 'XX-XXXX-X', //OPTIONAL -  Amazon service region
    }
});
```

You can also configure the library using the `aws-exports.js` file on your [AWS Mobile Hub](https://console.aws.amazon.com/mobilehub/home) project. Just click on the **Hosting and Streaming** feature tile then **Download aws-exports.js**.
Add the `aws-exports.js` file to the `src` folder in your app and add the following in your code:
```js
import Amplify from 'aws-amplify';
import aws_exports from './aws-exports';

Amplify.configure(aws_exports);

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
