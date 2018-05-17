---
---

# Quick Start

**Welcome to rock with AWS Amplify!** 

AWS Amplify is designed to provide you a more productive environment for connecting Cloud services and working with JavaScript. 

AWS Amplify can be used with any JavaScript front-end library. In addition, for React and React Native developers, we have extensions that can be leveraged. In this guide, we showcase the usage with React, React Native and AWS resources to get started.

## Create an app

<div class="nav-tab create" data-group='create'>
<ul class="tabs">
    <li class="tab-link current react" data-tab="react">React</li>
    <li class="tab-link react-native" data-tab="react-native">React Native</li>
    <li class="tab-link angular" data-tab="angular">Angular</li>
</ul>
<div id="react" class="tab-content current">
If you have an existing React application you can skip this section. Otherwise, please use  [Create React App](https://github.com/facebookincubator/create-react-app) to boostrap your application.

```bash
create-react-app my-app
cd my-app
npm start
```

After running the CLI commands, you should see a basic React application running in your browser.
</div>
<div id="react-native" class="tab-content" >

If you have an existing React Native application you can skip this section, but note the we have a [linking requirement](#linking-native-libraries-for-react-native) that may apply to your app.

[Create React Native App (CRNA)](https://github.com/react-community/create-react-native-app) is a command line utility to Create React Native apps with no build configuration. Run following commands to install CRNA and create your app:

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
<div id="angular" class="tab-content">
If you have an existing Angular application you can skip this section. Otherwise, you can use the [angular-cli](https://github.com/angular/angular-cli) to bootstrap a new angular app:

```bash
$ npm install -g @angular/cli
$ ng new myAmplifyProject
$ cd myAmplifyProject
```
</div>
</div>

## Install AWS Amplify 
AWS Amplify is available as an npm package. Run the following commands at the root directory of your application.

<div class="nav-tab install" data-group='install'>
<ul class="tabs">
    <li class="tab-link react current" data-tab="react">React</li>
    <li class="tab-link react-native" data-tab="react-native">React Native</li>
    <li class="tab-link angular" data-tab="angular">Angular</li>
</ul>
<div id="react" class="tab-content current">

```bash
$ npm install --save aws-amplify
```

On a React app, in addition to `aws-amplify`, we provide helpers and higher order components that are packaged in `aws-amplify-react`.

```bash
$ npm install --save aws-amplify-react # optional HOCs
```
</div>
<div id="react-native" class="tab-content">
```bash
$ npm install --save aws-amplify
```
For React Native, in addition to `aws-amplify`, we provide React Native specific components in `aws-amplify-react-native` package.

```bash
$ npm install --save aws-amplify-react-native
```

### Linking native libraries for React Native

If you have created your app with `create-react-native-app` in previous steps, you can **skip** this section.

AWS Amplify provides native libraries for React Native to support Amazon Cognito sign-in process. If you are using `create-react-native-app` or [Expo v25.0.0 or greater](https://blog.expo.io/expo-sdk-v25-0-0-is-now-available-714d10a8c3f7), those libraries are already included in your dependencies. Otherwise, you need to [link](https://facebook.github.io/react-native/docs/linking-libraries-ios.html) those libraries to your project.
{: .callout .callout--info}

Following example shows how you can link the libraries for a project that is created with `react-native init`:

 
```bash
$ react-native init myReactNativeApp
$ cd myReactNativeApp
$ npm install --save aws-amplify
$ npm install --save aws-amplify-react-native
$ react-native link amazon-cognito-identity-js
```


</div>
<div id="angular" class="tab-content">
```bash
$ npm install --save aws-amplify
```

In addition to `aws-amplify` core, you can install our angular module which provides a service provider, helpers and components:

```bash
$ npm install --save aws-amplify-angular
``` 

See the [angular guide](https://aws.github.io/aws-amplify/media/angular_guide) for details and usage.
</div>
</div>

## Install AWS Mobile CLI

You will use [awsmobile-cli](https://github.com/aws/awsmobile-cli) to configure your application work with AWS Mobile Hub, a platform for configuring and managing your cloud backend. Also, awsmobile-cli provides utilities for managing your backend, without visiting AWS Mobile Hub console.

```bash
$ npm install -g awsmobile-cli
```

If it is the first time you are using `awsmobile-cli`, you need to configure the CLI with your AWS credentials. To setup permissions for the toolchain used by the CLI, run:

```bash
$ awsmobile configure
```

If prompted for credentials, follow the steps provided by the CLI. For more information, see [Provide IAM credentials to AWS Mobile CLI](https://docs.aws.amazon.com/aws-mobile/latest/developerguide/aws-mobile-cli-credentials.html){:target="_blank"}.

## Set up Your Backend

AWS Amplify connects to AWS Mobile Hub to work with Amazon Web Services. 

You can quickly create your backend from scratch with Automatic Setup, or use Manual Setup to integrate AWS resources you have already configured.

### Automatic Setup

Automatic setup creates and configures new AWS resources for your backend by using the awsmobile-cli. 

To start, make sure your app has a folder named `/src`, as this is used by automatic setup for a backend configuration file fetched from your AWS Mobile Hub project:
```bash
$ mkdir src
```

`awsmobile init` creates a backend project for your app and pulls the service configuration into your project. App analytics and web hosting are enabled in new projects by default.


```bash
$ awsmobile init <optional-mobile-hub-project-id-for-existing-projects>
```

When you run `awsmobile init` command, you are asked for the details of your project. You can accept the defaults by typing `return` for each question. Automatic setup uses your answers to create your project in AWS Mobile Hub and copy the required configuration file to `src/aws-exports.js`.


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
{: .callout .callout--info}

You can also manually create and modify your AWS resources in the Mobile Hub console, as described in the following section. To integrate any manual backend changes, you must run:
```bash
awsmobile pull
```

This will update your app's `src/aws-exports.js` file. This contains the configuration metadata for your backend resources in Mobile Hub, and should not be modified manually. 

### Manual Setup to work with existing AWS Resources

If you want to use your existing AWS resources with your app (S3 buckets, Cognito user pools, etc.), you need to **manually configure** your app with your existing credentials in your code:


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
In the configuration above, you are required to pass in an Amazon Cognito identity pool ID so that AWS Amplify can retrieve base credentials for a user even in an un-authenticated state. 

**Configuration Parameters for existing AWS resources**
To see the configuration parameters for existing AWS resources, see the *Manual Setup* section in AWS Amplify Developer Guide for each individual service:
[Amazon Cognito]({%if jekyll.environment == 'production'%}{{site.amplify.baseurl}}{%endif%}/media/authentication_guide#manual-setup),
[Amazon S3]({%if jekyll.environment == 'production'%}{{site.amplify.baseurl}}{%endif%}/media/storage_guide#manual-setup),
[Amazon Pinpoint]({%if jekyll.environment == 'production'%}{{site.amplify.baseurl}}{%endif%}/media/analytics_guide#manual-setup),
[Amazon API Gateway]({%if jekyll.environment == 'production'%}{{site.amplify.baseurl}}{%endif%}/media/api_guide#manual-setup)
{: .callout .callout--info}


## Connect to Your Backend

Connecting to your backend at run time requires loading the required configuration in your app with `Amplify.configure()` method, at the entry point of your application (typically `App.js` for a React application).

First import the AWS Amplify library:  

```js
import Amplify from 'aws-amplify';
```

If you used Automatic Setup, add in the following code before your first [Component](https://reactjs.org/docs/components-and-props.html).

```js
import Amplify from 'aws-amplify';
import aws_exports from './aws-exports';

Amplify.configure(aws_exports);
```

If you used Manual Setup with existing AWS Resources, you will need to call `Amplify.configure()` with your custom configuration details as described in *Manual Setup* section.

## Adding Services to Your Backend

You can use the [awsmobile-cli](https://github.com/aws/awsmobile-cli) to manage your AWS backend.The `awsmobile features` command enables or disables services. 

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
 ◯ appsync
```

Remember to use `awsmobile push` to update your backend with the new configuration. This will refresh your `/src/aws-exports.js` file.

```
$ awsmobile push     
```

### Accessing AWS Mobile Hub Console

You can access your AWS Mobile Hub Console anytime to monitor or modify your AWS backend services. Simply type following command in your project root directory:

```
$ awsmobile console
```

## Start Monitoring Your App Analytics

To see app analytics data, run `awsmobile console`, choose Analytics in the upper right of the AWS Mobile Hub console, and then Analytics again in the upper left of the [Amazon Pinpoint console](https://console.aws.amazon.com/pinpoint/home/).

![Pinpoint Console]({%if jekyll.environment == 'production'%}{{site.amplify.baseurl}}{%endif%}/media/images/pinpoint_dashboard.png)

By default, app analytics is enabled for tracking *user session* tracking. To enable additional tracking events, open `/src/App.js`, and add two lines of code.

```js
import { Analytics } from 'aws-amplify';

...
    render() {
        Analytics.record('appRender');
...
```

This will record an **appRender** event every time a user launches your app.

You can easily add custom analytics events to suit your purposes. For more information about Analytics Category, see [AWS Amplify Analytics Developer Guide]({%if jekyll.environment == 'production'%}{{site.amplify.baseurl}}{%endif%}/media/analytics_guide)
{: .callout .callout--info}

## Add User Authentication to Your App

AWS Amplify provides out-of-the-box user authentication experience with `withAuthenticator` Higher Order Component for React and React Native.

<div class="nav-tab auth" data-group='auth'>
<ul class="tabs">
    <li class="tab-link react current" data-tab="react">React</li>
    <li class="tab-link react-native" data-tab="react-native">React Native</li>
    <li class="tab-link angular" data-tab="angular">Angular</li>
</ul>
<div id="react" class="tab-content current">

In your `App.js`, add an import for `withAuthenticator` and wrap your default component export as seen below:
```js
import { withAuthenticator } from 'aws-amplify-react';

...
export default withAuthenticator(App);
```

This will wrap the entire application inside an Authentication UI. Only signed in users will have access to use your application's features.

<img src="https://dha4w82d62smt.cloudfront.net/items/2R3r0P453o2s2c2f3W2O/Screen%20Recording%202018-02-11%20at%2003.48%20PM.gif" style="display: block;height: auto;width: 100%;"/>

</div>
<div id="react-native" class="tab-content" >

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

<img src="{%if jekyll.environment == 'production'%}{{site.amplify.baseurl}}{%endif%}/media/images/react_native_with_authenticator.png" width="100%"/>

</div>
<div id="angular" class="tab-content">

For enabling authentication in your Angular app, you can use the service provider Auth API directly or the built in component. Once you've configured the module, you can include the `amplify-authenticator` anywhere in your app:

```js

    // app.component.html
    <amplify-authenticator></amplify-authenticator>

```

Within your controller, you can listen for authentication state changes using the service provider:

```js

    // app.component.ts
    import { AmplifyService }  from 'aws-amplify-angular';
    ...
    constructor( public amplify:AmplifyService ) {
        this.amplify = amplify;
        this.amplify.authStateChange$
          .subscribe(authState => {
            this.authenticated = authState.state === 'signedIn';
            if (!authState.user) {
              this.user = null;
            } else {
              this.user = authState.user;
            }
          });
    }
    
```

</div>
</div>

For more information about Authentication Category, see [AWS Amplify Authentication Developer Guide]({%if jekyll.environment == 'production'%}{{site.amplify.baseurl}}{%endif%}/media/authentication_guide)
{: .callout .callout--info}


## Working with AWS Service Interface Objects

AWS Amplify provides a declarative API to work with Amazon Cognito, Amazon API Gateway, Amazon Pinpoint and Amazon S3. For working with other AWS Services, you can use service interface objects. 

Note: In order to work with service interface objects, your Amazon Cognito users' [IAM role](https://docs.aws.amazon.com/cognito/latest/developerguide/iam-roles.html) must have the appropriate permissions to call the requested services.
{: .callout .callout--warning}

You can call methods on any AWS Service interface object by passing your credentials from `Auth` to the service call constructor:

```js
import Route53 from 'aws-sdk/clients/route53';

...

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
{: .callout .callout--info}
 
