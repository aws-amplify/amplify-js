---
# Page settings
layout: default
---

# Quick Start

**Welcome to rock with AWS Amplify!** AWS Amplify is designed to provide you a more productive environment for connecting Cloud services and working with JavaScript. 

AWS Amplify can be used with any JavaScript front-end library. In addition, for React and React Native developers, we have extensions that can be leveraged. In this guide, we showcase the usage with React, React Native and AWS resources to get started.

## Create an app

<div class="nav-tab create" data-group='create'>
<ul class="tabs">
    <li class="tab-link react current" data-tab="tab-1">React</li>
    <li class="tab-link react-native" data-tab="tab-2">React Native</li>
</ul>
<div id="tab-1" class="tab-content current">
If you have an existing React application you can skip this section. Otherwise, please use  [Create React App](https://github.com/facebookincubator/create-react-app) to boostrap your application.

```bash
create-react-app amplify-start
cd amplify-start
npm start
```

After running the CLI commands, you should see a basic React application running in your browser.
</div>
<div id="tab-2" class="tab-content" >
AWS Amplify is available as an npm package and supports both web and React Native core APIs. Run the following from the current directory of your application:
```bash
$ npm install aws-amplify
$ npm install aws-amplify-react-native
```

**Create React Native App (CRNA)**

[Create React Native App (CRNA)](https://github.com/react-community/create-react-native-app) is a command line utility to crate Create React Native apps with no build configuration. Run following commands to install CRNA and create your app:

```bash
$ npm install -g create-react-native-app
$ create-react-native-app myAmplifyProject
$ cd myAmplifyProject
```

Note: project name is in camelCase to avoid problems when testing on a physical iOS phone.
{: .callout .callout--info}

Then run your app:

```bash
$ react-native run-ios  # or run-android
```
</div>
</div>

## Install AWS Amplify 
AWS Amplify is available as an npm package. Run the following commands at the root directory of your application.

<div class="nav-tab install" data-group='install'>
<ul class="tabs">
    <li class="tab-link react current" data-tab="tab-1">React</li>
    <li class="tab-link react-native" data-tab="tab-2">React Native</li>
</ul>
<div id="tab-1" class="tab-content current">
```On a React app, in addition to `aws-amplify`, we provide helpers and higher order components that are packaged in `aws-amplify-react`
```bash
npm install aws-amplify
```
```bash
# not required but contains higher order components
npm install aws-amplify-react
```
</div>
<div id="tab-2" class="tab-content">
For React Native, in addition to `aws-amplify`, we provide React Native specific components with `aws-amplify-react-native` package
```bash
npm install aws-amplify
```
```bash
npm install aws-amplify-react-native
```

### Linking native libraries for React Native

AWS Amplify provides native libraries for React Native for authentication, specifically for Amazon Cognito sign-in process. If you are using `create-react-native-app` or [Expo v25.0.0 or greater](https://blog.expo.io/expo-sdk-v25-0-0-is-now-available-714d10a8c3f7), those libraries are already included in your app. Otherwise, you need to [link](https://facebook.github.io/react-native/docs/linking-libraries-ios.html) those libraries to your project.

Following example shows how you can link the libraries for a project that is created with `react-native init`:

 
```bash
$ react-native init myReactNativeApp
$ cd myReactNativeApp
$ npm install --save aws-amplify
$ npm install --save aws-amplify-react-native
$ react-native link amazon-cognito-identity-js
```


</div>
</div>

## Install and Configure awsmobile CLI
AWS Amplify connects to AWS Mobile Hub to work with Amazon Web Services. You can use [awsmobile-cli](https://github.com/aws/awsmobile-cli) to create a new AWS Mobile Hub project or enable an existing project to work with AWS Mobile Hub. 

```bash
$ npm install -g awsmobile-cli
```

If it is the first time you are using `awsmobile-cli`, you need to configure the CLI with your AWS credentials. To setup permissions for the toolchain used by the CLI, run:

```bash
$ awsmobile configure
```

If prompted for credentials, follow the steps provided by the CLI. For more information, see [Provide IAM credentials to AWS Mobile CLI](https://docs.aws.amazon.com/aws-mobile/latest/developerguide/aws-mobile-cli-credentials.html).

## Set up Your Backend

You have two alternatives to setup your backend, depending on if your want to utilize your existing AWS resources. 

### Working with existing AWS Resources

If you want to use your existing AWS resources (S3 Buckets, Cognito User Pools, etc.) with your app, you need to **manually configure** your app with your existing credentials in your code:


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
In the configuration above, you are required to pass in an Amazon Cognito Identity Pool ID so that AWS Amplify can retrieve base credentials for a user even in an un-authenticated state. 

**Configuration Parameters for existing AWS resources**
To see the configuration parameters for existing AWS resources, see the *Manual Setup* section in AWS Amplify Developer Guide for each individual service:
[Amazon Cognito](/media/authentication_guide/index.html#manual-setup),
[Amazon S3](/media/storage_guide/index.html#manual-setup),
[Amazon Pinpoint](/media/analytics_guide/index.html#manual-setup),
[Amazon API Gateway](/media/api_guide/#manual-setup)
{: .callout .callout--info}

### Working with new AWS resources

If you are willing to create new AWS resources and use those resources in your app, you can set up your backend with `awsmobile-cli` or directly from [AWS Mobile Hub](https://aws.amazon.com/mobile/) console.

The `init` command creates a backend project for your app. By default, analytics and web hosting are enabled in your backend and this configuration is automatically pulled into your app when you initialize.

```bash
$ awsmobile init <optional-mobile-hub-project-id-for-existing-projects>
```

`awsmobile init` command will ask for the details of your project, create your project in AWS Mobile Hub and copy the required configuration file to `src/aws-exports.js`.

```terminal
Please tell us about your project:
? Where is your project's source directory:  src
? Where is your project's distribution directory that stores build artifacts:  build
? What is your project's build command:  npm run-script build
? What is your project's start command for local test run:  npm run-script start

? What awsmobile project name would you like to use:  amplify-start-2018-02-28-14-44-42

Successfully created AWS Mobile Hub project: amplify-start-2018-02-28-14-44-42

retrieving the latest backend awsmobile project information
awsmobile project's details logged at: awsmobilejs/#current-backend-info/backend-details.json
awsmobile project's access information logged at: awsmobilejs/#current-backend-info/aws-exports.js
awsmobile project's access information copied to: src/aws-exports.js
awsmobile project's specifications logged at: awsmobilejs/#current-backend-info/mobile-hub-project.yml
contents in #current-backend-info/ is synchronized with the latest in the aws cloud
```

Please note that backend resources that are created with `awsmobile init` are copied to *awsmobilejs/#current-backend-info* project folder. When you change your backend configuration and run `awsmobile pull`, the contents of the folder will be updated automatically, and a new copy of the configuration file will be copied to *src/aws-exports.js* folder.

You can retrieve your `aws-exports.js` file on AWS Mobile Hub and download the configuration file into your project, but remember that this file is auto-generated by AWS Mobile Hub and is not supposed to edit manually.  
{: .callout .callout--info}

## Connect to Your Backend

Connecting to your backend requires loading the required configuration in your app with `Amplify.configure()` method. If you have used AWS Mobile Hub to create your app, at the entry point of your application (typically `App.js` for a React application) add in the following code before your first [Component](https://reactjs.org/docs/components-and-props.html).

```js
import Amplify from 'aws-amplify';
import aws_exports from './aws-exports';

Amplify.configure(aws_exports);
```

In case you are setting up the configuration manually, you will need to call `Amplify.configure()`  with your custom configuration details.

## Adding Services to Your Backend

You can use the [awsmobile-cli](https://github.com/aws/awsmobile-cli) to manage your AWS backend. `awsmobile features` command enables or disables services. 

```
$ awsmobile features    
```

```terminal
 select features:  (Press <space> to select, <a> to toggle all, <i> to inverse selection)
❯◯ user-signin
 ◯ user-files
 ◯ cloud-api
 ◯ database
 ◉ analytics
 ◉ hosting
```
After you make your chandes, `awsmobile push` updates your backend with the new configuration. After your backend is updated, a new configuration file will be copied to `/src/aws-exports.js` location to be used in your app.

```
$ awsmobile push     
```

### Accessing AWS Mobile Hub Console

You can access your AWS Mobile Hub Console anytime to monitor or modify your AWS backend. Simply type following command in your project root directory:

```
$ awsmobile console
```

## Start Monitoring Your App Analytics

After successfully configuring your app, analytics data is automatically collected and sent to Amazon Pinpoint. To see app analytics data, visit [Amazon Pinpoint console](https://console.aws.amazon.com/pinpoint/home/), or visit AWS Mobile Hub console by typing `awsmobile console`.


Default app analytics is enabled for user session tracking, and can add additional tracking events if you like. Open `/src/App.js`, and add two lines of code.

```js
import { Analytics } from 'aws-amplify';

...
    render() {
        Analytics.record('appRender');
...
```

This will record an **appRender** event every time a user launches your app.

For more information about Analytics Category, see [AWS Amplify Analytics Developer Guide](/media/authentication_guide/index.html)
{: .callout .callout--info}

## Add User Authentication to Your App

AWS Amplify provides out-of-the-box user authentication experience with `withAuthenticator` Higher Order Component for React and React Native.

<div class="nav-tab auth" data-group='auth'>
<ul class="tabs">
    <li class="tab-link react current" data-tab="tab-1">React</li>
    <li class="tab-link react-native" data-tab="tab-2">React Native</li>
</ul>
<div id="tab-1" class="tab-content current">

In your `App.js`, add one import and wrap your default component export as seen below:
```js
import { withAuthenticator } from 'aws-amplify-react';

...
export default withAuthenticator(App);
```

This will wrap the entire application inside an Authentication UI. Only signed in users will have access to use your application's features.

<img src="https://dha4w82d62smt.cloudfront.net/items/2R3r0P453o2s2c2f3W2O/Screen%20Recording%202018-02-11%20at%2003.48%20PM.gif" style="display: block;height: auto;width: 100%;"/>

</div>
<div id="tab-2" class="tab-content" >

For enabling authentication for React Native app, modify `App.js` as following:

```js
...
import { withAuthenticator } from 'aws-amplify-react-native';

class App extends React.Component {
...
}

export default withAuthenticator(App);
...
```

Reload your application on the physical device or emulator/simulator:

<img src="../react_native_with_authenticator.png" width="360px"/>

</div>
</div>

For more information about Authentication Category, see [AWS Amplify Authentication Developer Guide](/media/authentication_guide/index.html)
{: .callout .callout--info}


## Working with other AWS Services

AWS Amplify provides a declerative API to work with Amazon Cognito, Amazon API Gateway, Amazon Pinpoint and Amazon S3. For working with other AWS Servies, you can use service interface objects. 

You can call methods on any AWS Service interface object by passing your credentials from `Auth` to the service call constructor:

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

Full API Documentation for service interface objects is available [here](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/_index.html).

Note: In order to work with service interface objects, your Amazon Cognito users' [IAM role](https://docs.aws.amazon.com/cognito/latest/developerguide/iam-roles.html) must have the appropriate permissions to call the requested services.
{: .callout .callout--warning}

 