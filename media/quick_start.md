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
AWS Amplify is available as an npm packages. Run the following from the current directory of your application:
```bash
npm install --save aws-amplify
npm install --save aws-amplify-react
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

AWS Mobile Hub streamlines the steps above for you. Simply click the button:

<p align="center">
  <a target="_blank" href="https://console.aws.amazon.com/mobilehub/home?#/?config=https://github.com/aws/aws-amplify/blob/master/media/backend/import_mobilehub/quick_start.zip">
    <span>
        <img height="100%" src="https://s3.amazonaws.com/deploytomh/button-deploy-aws-mh.png"/>
    </span>
  </a>
</p>

This will create a fully functioning project that works with the Auth and Analytics categories. After the project is created, in the Mobile Hub console download aws-exports.js by clicking the **Hosting and Streaming** tile then **Download aws-exports.js**.

![Mobile Hub](mobile_hub_1.png)

Download aws-exports.js, then copy the file to `/src` folder of your project.

![Download](mobile_hub_2.png)


Now simply import the file and pass it as the configuration to the Amplify library:

```js
import Amplify from 'aws-amplify';
import aws_exports from './aws-exports.js';

Amplify.configure(aws_exports);
```

After configuration, user session metrics are automatically collected and send to Amazon Pinpoint. To see these metrics click [here](https://console.aws.amazon.com/pinpoint/home/) or in your Mobile Hub project click the **Engage** tab on the left of the screen.

![Session](mobile_hub_3.png)

## More Analytics

Now that you've got basic tracking for user sessions, you may wish to add additional metrics for analytics recording in your application. Open `/src/App.js`, add two lines of code.

```js
import { Analytics } from 'aws-amplify';

...
    render() {
        Analytics.record('appRender');
...
```

This will record an **appRender** event everytime user opens app.

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

For more about Authenticator, click [here](../packages/aws-amplify-react/media/authenticator.md)

## React Native Development

React Native installation is a little bit different.

First of all, the package is `aws-amplify-react-native`, which includes core library and React Native components.

Secondly, authentication requires some computation power for security reason. Because of that, some native code are included. As a result, you need to [Link Libraries](https://facebook.github.io/react-native/docs/linking-libraries-ios.html) to your project.

Let's follow steps to create a new app.

**Create React Native App**

Follow steps [here](https://facebook.github.io/react-native/blog/2017/03/13/introducing-create-react-native-app.html)

```bash
npm i -g create-react-native-app
$ create-react-native-app myProject
$ cd myProject
$ npm start
```

Note: project name in camalCase will save you trouble when testing on a physical iOS phone.

**Install AWS Amplify**

```bash
npm install --save aws-amplify-react-native
```

**React Native Link**

Now link library `amazon-cognito-identity-js`. Before that, you have to `eject` the project.

```bash
npm install
npm run eject
```

Answer a few questions, project ejected.

Then link the library

```bash
react-native link amazon-cognito-identity-js
```

Run app

```bash
react-native run-ios
```

**Include Authenticator**

Now, modify `App.js`

```js
...

import Amplify, { withAuthenticator } from 'aws-amplify-react-native';
import aws_exports from './aws-exports';

Amplify.configure(aws_exports);

class App extends React.Component {

...

}

export default withAuthenticator(App);

...
```

Reload app
