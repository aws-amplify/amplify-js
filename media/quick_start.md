# Quick Start
AWS Amplify is not limited to AWS or React. However for easier demonstration and getting started we showcase the usage with a React application and AWS resources.

* [Installation](#installation)
* [Configuration](#configuration)
* [More Analytics](#more-analytics)
* [Bind Authentications](#bind-authentications)

You can begin with an existing React application. Otherwise, please use  [Create React App](https://github.com/facebookincubator/create-react-app)

```
create-react-app amplify-start
cd amplify-start
npm start
```

You should see a typical React application running in your browser.

## Install Amplify 
AWS Amplify is available as npm packages. Run the following from the current directory of your application:
```
npm install --save aws-amplify
npm install --save aws-amplify-react
```

## Configuration

At the top of your application entry point (typically, `App.js` for a React application) add in the following code before your first [Component](https://reactjs.org/docs/components-and-props.html) in order to configure the library .

```
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

In the above configuration you are required to pass in an Amazon Cognito Identity Pool ID so that the library can retrieve base credentials for a user even in an UnAuthenticated state. If you pass in properties in the Analytics section for Amazon Pinpoint the library will automatically track some base metrics for you without any effort on your part. 

### Manual Setup

[Amazon Cognito Identity](http://docs.aws.amazon.com/cognito/latest/developerguide/getting-started-with-identity-pools.html)

[Amazon Cognito User Pools](http://docs.aws.amazon.com/cognito/latest/developerguide/getting-started-with-cognito-user-pools.html)

[Amazon Pinpoint](http://docs.aws.amazon.com/pinpoint/latest/developerguide/getting-started.html)

### Automated Setup

AWS Mobile Hub streamlines the steps above for you. Simply click the button:

<p align="center">
  <a target="_blank" href="https://console.aws.amazon.com/mobilehub/home?#/?config=https://github.com/aws/aws-amplify/blob/master/media/backend/import_mobilehub/quick_start.zip">
    <span>
        <img height="100%" src="https://s3.amazonaws.com/deploytomh/button-deploy-aws-mh.png"/>
    </span>
  </a>
</p>

This will create a project that works with the Auth and Analytics categories fully functioning. After the project is created in the Mobile Hub console download aws-exports.js by clicking the **Hosting and Streaming** tile then **Download aws-exports.js**.

![Mobile Hub](mobile_hub_1.png)

Download aws-exports.js

Then copy the file to `/src` folder of the project
![Download](mobile_hub_2.png)


Now you can simply import the file and pass it as the configuration to the Amplify library:

Open `/src/App.js`, add these lines
```
import Amplify from 'aws-amplify';
import aws_exports from './aws-exports.js';

Amplify.configure(aws_exports);
```

After configuration, user session metrics are automatically collected and send to Amazon Pinpoint. To see these metrics click [here](https://console.aws.amazon.com/pinpoint/home/) or in your Mobile Hub project click the **Engage** tab on the left of the screen.

![Session](mobile_hub_3.png)

## More Analytics

Now that you've got basic tracking for user sessions, you may wish to add additional metrics for analytics recording in your application. Open `/src/App.js`, add two lines of code.

```
import { Analytics } from 'aws-amplify';

...
    render() {
        Analytics.record('appRender');
...
```

This will record an 'appRender' event everytime user opens app.

For more about Analytics, click [here](analytics_guide.md)

## Bind Authentications

Open `/src/App.js`, add one import and modify the last line of code.
```
import { withAuthenticator } from 'aws-amplify-react';

...

export default withAuthenticator(App);
```

This will wrap your app inside an Authentication UI. Only signed in user have access to app.
<img src="sign_in.png" width="320px"/>

For more about Authenticator, click [here](../packages/aws-amplify-react/media/authenticator.md)

