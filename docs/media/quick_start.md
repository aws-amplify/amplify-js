---
---

# Get Started

<p class="orange-subheader">Welcome builder!</p>

AWS Amplify is designed to provide you a more productive environment for connecting cloud services and working with JavaScript. This document will get you started with AWS Amplify library and Amplify CLI for your JavaScript projects.

## Step 1. Set up your Development Environment 

We strongly recommend using the Amplify CLI for building the serverless backend for your app. If you have already installed the CLI, skip ahead to [Step 2. Create a New Project](#step-2-create-a-new-project).

- [Sign up for an AWS Account](https://portal.aws.amazon.com/billing/signup?redirect_url=https%3A%2F%2Faws.amazon.com%2Fregistration-confirmation#/start).
- Install [Node.js®](https://nodejs.org/en/download/) and [npm](https://www.npmjs.com/get-npm) if they are not already on your machine.

Note: Verify that you are running at least Node.js version 8.x or greater and npm version 5.x or greater by running :code:`node -v` and :code:`npm -v` in a terminal/console window. Older versions may produce errors and are unsupported.
{: .callout .callout--action}

Now, install and configure the Amplify CLI globally.

```bash
$ npm install -g @aws-amplify/cli
$ amplify configure
```

<<<<<<< HEAD
Check the minimum requirements for your development environment.
=======
When prompted for credentials and your development environment, follow the steps provided by the CLI. For more information on individual installation steps, visit [AWS Amplify JavaScript Installation Guide]({%if jekyll.environment == 'production'%}{{site.amplify.docs_baseurl}}{%endif%}/media/install_n_config?platform=react&ref_url=/amplify-js/media/quick_start&ref_content={{"Get Started" | uri_escape }}&ref_content_section=automatic-setup){: target='_new'}.
{: .callout .callout--action}
>>>>>>> 1b61da2336f97d98dbd9335bc0b6deb6c878c239

## Step 2. Create a New Project

<div class="nav-tab create" data-group='create'>
<ul class="tabs">
    <li class="tab-link current react" data-tab="react">React</li>
    <li class="tab-link react-native" data-tab="react-native">React Native</li>
    <li class="tab-link angular" data-tab="angular">Angular</li>
    <li class="tab-link ionic" data-tab="ionic">Ionic</li>
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

If you have an existing React Native application, you can skip this section, but note that we have a [linking requirement](#linking-native-libraries-for-react-native) that may apply to your app.

[Create React Native App (CRNA)](https://github.com/react-community/create-react-native-app) is a command line utility to Create React Native apps with no build configuration. Run following commands to install CRNA and create your app:

```bash
$ npm install -g create-react-native-app
$ create-react-native-app myAmplifyProject
$ cd myAmplifyProject
```

Note: the project name is in camelCase to avoid problems when testing on a physical iOS phone.
{: .callout .callout--info}

Then run your app:

```bash
$ react-native run-ios  # or run-android
```
</div>
<div id="angular" class="tab-content">
If you have an existing Angular application you can skip this section. Otherwise, you can use the [angular-cli](https://github.com/angular/angular-cli) to bootstrap a new Angular app:

```bash
$ npm install -g @angular/cli
$ ng new myAmplifyProject
$ cd myAmplifyProject
```
</div>
<div id="ionic" class="tab-content">
If you have an existing Ionic application you can skip this section. Otherwise, you can use the Ionic CLI to bootstrap a new Ionic app:

```bash
$ npm install -g ionic cordova
$ ionic start myAmplifyProject tabs --type=angular 
$ cd myAmplifyProject
```
</div>
</div>

## Step 3. Install AWS Amplify 

AWS Amplify is available as an npm package. Run the following commands at the root directory of your application.

<div class="nav-tab install" data-group='install'>
<ul class="tabs">
    <li class="tab-link angular" data-tab="angular">Angular</li>
    <li class="tab-link ionic" data-tab="ionic">Ionic</li>
    <li class="tab-link purejs" data-tab="purejs">JavaScript</li>
    <li class="tab-link react current" data-tab="react">React</li>
    <li class="tab-link react-native" data-tab="react-native">React Native</li>
</ul>
<div id="purejs" class="tab-content">

```bash
$ npm install --save aws-amplify
```

</div>
<div id="react" class="tab-content current">

```bash
$ npm install --save aws-amplify
```

On a React app, in addition to *aws-amplify*, we provide helpers and higher order components that are packaged in *aws-amplify-react*.

```bash
$ npm install --save aws-amplify-react # optional HOCs
```
</div>
<div id="react-native" class="tab-content">
```bash
$ npm install --save aws-amplify
```
For React Native, in addition to *aws-amplify*, we provide React Native specific components in `aws-amplify-react-native` package.

```bash
$ npm install --save aws-amplify-react-native
```

### Linking native libraries for React Native

If you have created your app with *create-react-native-app* in previous steps, you can **skip** this section.

AWS Amplify provides native libraries for React Native to support Amazon Cognito sign-in process. If you are using *create-react-native-app* or [Expo v25.0.0 or greater](https://blog.expo.io/expo-sdk-v25-0-0-is-now-available-714d10a8c3f7), those libraries are already included in your dependencies. Otherwise, you need to [link](https://facebook.github.io/react-native/docs/linking-libraries-ios.html) those libraries to your project.
{: .callout .callout--info}

Following example shows how you can link the libraries for a project that is created with *react-native init*:

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

In addition to *aws-amplify* core, you can install our angular module which provides a service provider, helpers, and components:

```bash
$ npm install --save aws-amplify-angular
``` 

See the [Angular Guide](https://aws-amplify.github.io/amplify-js/media/angular_guide){: target='_new'} for details and usage.
{: .callout .callout--action}

</div>
<div id="ionic" class="tab-content">
```bash
$ npm install --save aws-amplify
```

In addition to `aws-amplify` core, you can install our angular module which provides a service provider, helpers, and components:

```bash
$ npm install --save aws-amplify-angular
``` 

See the [Ionic Guide](https://aws-amplify.github.io/amplify-js/media/ionic_guide){: target='_new'} for details and usage.
{: .callout .callout--action}

</div>
</div>

Amplify CLI uses `yarn` package manager to install dependencies. You can install *yarn* with npm:

```bash
$ npm install -g yarn
```

## Step 4. Set up Your Backend

You can quickly create your backend from scratch with Automatic Setup, or use Manual Setup to integrate AWS resources you have already configured.

#### Automatic Setup with the CLI

Amplify CLI creates and configures AWS resources for your backend. To start, make sure your app has a folder named `/src`, as this folder is used to store your backend configuration file:

```bash
$ mkdir src
```

`amplify init` creates a backend project for your app and pulls the service configuration into your project. 

```bash
$ amplify init 
```

When you run *amplify init* command, you are asked for the details of your project. You can accept the defaults by typing *return* for each question. Automatic setup uses your answers to create your project backend copy the required configuration file to `src/aws-exports.js`.

For more information on individual CLI installation steps, visit [AWS Amplify JavaScript Installation Guide]({%if jekyll.environment == 'production'%}{{site.amplify.baseurl}}{%endif%}/media/install_n_config?platform=react&ref_url=/amplify-js/media/quick_start&ref_content={{"Get Started" | uri_escape }}&ref_content_section=automatic-setup){: target='_new'}.
{: .callout .callout--action}

#### Manual Setup to work with existing AWS Resources

If you want to use your existing AWS resources with your app (S3 buckets, Cognito user pools, etc.), you need to **manually configure** your app with your current credentials in your code:

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

In the configuration above, you are required to pass in an Amazon Cognito identity pool ID so that AWS Amplify can retrieve base credentials for a user even in an unauthenticated state. 

**Configuration Parameters for existing AWS resources**
To see the configuration parameters for existing AWS resources, see the *Manual Setup* section in AWS Amplify Developer Guide for each individual service:
[Amazon Cognito]({%if jekyll.environment == 'production'%}{{site.amplify.docs_baseurl}}{%endif%}/media/authentication_guide#manual-setup),
[Amazon S3]({%if jekyll.environment == 'production'%}{{site.amplify.docs_baseurl}}{%endif%}/media/storage_guide#manual-setup),
[Amazon Pinpoint]({%if jekyll.environment == 'production'%}{{site.amplify.docs_baseurl}}{%endif%}/media/analytics_guide#manual-setup),
[Amazon API Gateway]({%if jekyll.environment == 'production'%}{{site.amplify.docs_baseurl}}{%endif%}/media/api_guide#manual-setup)
{: .callout .callout--info}


## Step 5. Connect to Your Backend

Connecting to your backend at runtime requires loading the required configuration in your app with `Amplify.configure()` method, at the entry point of your application (typically *App.js* for a React application).

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

#### Using with Script Tag

If you are importing AWS Amplify library with a **HTML script tag**, please add the following definition in your code, and access categories with `Amplify` prefix, e.g., **Amplify.Analytics.configure** instead of **Analytics.configure**:

```js
const Amplify = window['aws-amplify'];

Amplify.Analytics.configure({
    // ....
 });
```

See a sample app which uses script tag [here](https://jsfiddle.net/0gmqtq7g/226/).

#### Using with TypeScript

If you are using TypeScript, importing the configuration file is done differently. You can rename **aws-exports.js** to **aws-exports.ts** and use import statement. Alternatively, you can use:

```js
const aws_exports = require('../../aws-exports').default;
```

## Step 6. Add Backend Features

Adding backend features to your app is very easy with Amplify CLI. You can  use `amplify add` command with the respective feature name:

```bash
$ amplify add <feature-name>
```

Run *amplify* anytime to see available services:

```terminal
| Category  |
| --------- |
| analytics |
| api       |
| auth      |
| function  |
| hosting   |
| storage   |
```

Remember to use `amplify push` to update your backend with the new configuration. This will refresh your local */src/aws-exports.js* file.

```bash
$ amplify push
```

#### Add Analytics

To enable analytics in your app, run:

```bash
$ amplify add analytics
$ amplify push
```

To see app analytics data, visit [Amazon Pinpoint console](https://console.aws.amazon.com/pinpoint/home/).

![Pinpoint Console]({%if jekyll.environment == 'production'%}{{site.amplify.docs_baseurl}}{%endif%}/media/images/pinpoint_dashboard.png)

By default, app analytics is enabled for tracking *user session* tracking. To add additional tracking events, open */src/App.js*, and add the following code.

```js
import { Analytics } from 'aws-amplify';

...
    render() {
        Analytics.record('appRender');
...
```

This will record an *appRender* event every time a user launches your app.

You can easily add custom analytics events to suit your purposes. For more information about Analytics Category, see [AWS Amplify Analytics Developer Guide]({%if jekyll.environment == 'production'%}{{site.amplify.docs_baseurl}}{%endif%}/media/analytics_guide)
{: .callout .callout--info}

#### Add User Authentication 

To enable authentication in your app, run:

```bash
$ amplify add auth
$ amplify push
```

AWS Amplify provides out-of-the-box user authentication experience with `withAuthenticator` Higher Order Component for React and React Native.

<div class="nav-tab auth" data-group='auth'>
<ul class="tabs">
    <li class="tab-link react current" data-tab="react">React</li>
    <li class="tab-link react-native" data-tab="react-native">React Native</li>
    <li class="tab-link angular" data-tab="angular">Angular</li>
    <li class="tab-link ionic" data-tab="ionic">Ionic</li>
</ul>
<div id="react" class="tab-content current">

In your *App.js*, add an import for *withAuthenticator* and wrap your default component export as seen below:
```js
import { withAuthenticator } from 'aws-amplify-react';

...
export default withAuthenticator(App);
```

This will wrap the entire application inside an Authentication UI. Only signed in users will have access to use your application's features.

Note:
If you are using aws-amplify@1.x.x and aws-amplify-react@1.x.x, then please make sure you import those in the order like:
```js
import Amplify from 'aws-amplify';
import { withAuthenticator } from 'aws-amplify-react';
```

<img src="https://dha4w82d62smt.cloudfront.net/items/2R3r0P453o2s2c2f3W2O/Screen%20Recording%202018-02-11%20at%2003.48%20PM.gif" style="display: block;height: auto;width: 100%;"/>

</div>
<div id="react-native" class="tab-content" >

For enabling authentication for React Native app, modify *App.js* as following:

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

<img src="{%if jekyll.environment == 'production'%}{{site.amplify.docs_baseurl}}{%endif%}/media/images/react_native_with_authenticator.png" width="100%"/>

</div>
<div id="angular" class="tab-content">

For enabling authentication in your Angular app, you can use the service provider Auth API directly or the built-in component. Once you've configured the module, you can include the `amplify-authenticator` anywhere in your app:
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
<div id="ionic" class="tab-content">

For enabling authentication in your Ionic app, you can use the service provider Auth API directly or the built-in component. Once you've configured the module, you can include the `amplify-authenticator` anywhere in your app:

```js

    // app.component.html
    <amplify-authenticator framework="ionic"></amplify-authenticator>

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

For more information about Authentication Category, see [AWS Amplify Authentication Developer Guide]({%if jekyll.environment == 'production'%}{{site.amplify.docs_baseurl}}{%endif%}/media/authentication_guide)
{: .callout .callout--info}

##### Working with AWS Service Interface Objects

AWS Amplify provides a declarative API to work with Amazon Cognito, Amazon API Gateway, Amazon Pinpoint and Amazon S3. For working with other AWS Services, you can use service interface objects. 

Note: To work with service interface objects, your Amazon Cognito users' [IAM role](https://docs.aws.amazon.com/cognito/latest/developerguide/iam-roles.html) must have the appropriate permissions to call the requested services.
{: .callout .callout--warning}

You can call methods on any AWS Service interface object by passing your credentials from *Auth* to the service call constructor:

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

## Learn More

<div class="nav-tab more" data-group='more'>
<ul class="tabs">
    <li class="tab-link angular" data-tab="angular">Angular</li>
    <li class="tab-link ionic" data-tab="ionic">Ionic</li>
    <li class="tab-link purejs" data-tab="purejs">JavaScript (no library)</li>
    <li class="tab-link react current" data-tab="react">React</li>
    <li class="tab-link react-native" data-tab="react-native">React Native</li>
</ul>
<div id="purejs" class="tab-content"></div>
<div id="react" class="tab-content current">
Learn more about using React with AWS Amplify in [AWS Amplify React Guide]({%if jekyll.environment == 'production'%}{{site.amplify.docs_baseurl}}{%endif%}/media/react_guide).
</div>
<div id="react-native" class="tab-content">
Learn more about using React Native with AWS Amplify in [AWS Amplify React Native Guide]({%if jekyll.environment == 'production'%}{{site.amplify.docs_baseurl}}{%endif%}/media/react_native_guide).
</div>
<div id="angular" class="tab-content">
Learn more about using Angular with AWS Amplify in [AWS Amplify Angular Guide]({%if jekyll.environment == 'production'%}{{site.amplify.docs_baseurl}}{%endif%}/media/angular_guide).
</div>
<div id="ionic" class="tab-content">
Learn more about using Ionic with AWS Amplify in [AWS Amplify Ionic Guide]({%if jekyll.environment == 'production'%}{{site.amplify.docs_baseurl}}{%endif%}/media/ionic_guide).
</div>
</div>

Visit [AWS Amplify Developer Guide]({%if jekyll.environment == 'production'%}{{site.amplify.baseurl}}{%endif%}/media/developer_guide) to learn more about AWS Amplify categories.