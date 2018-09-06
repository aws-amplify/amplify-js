---
---

# Getting Started

AWS Amplify provides the foundation for your cloud-powered mobile and web apps. AWS Amplify includes a JavaScript library for your Web and React Native projects, a style guide including UI components, and the Amplify CLI toolchain for hosting and for managing backends in the AWS cloud. The goal of this guide is to build or integrate an app with AWS Amplify. Use the drop-down menu in the top right to choose the framework that you want to work with.

## Step 1. Set up your Development Environment 

Install the Amplify CLI for building the serverless backend for your app. If you have already installed the CLI, skip ahead to [Step 2. Create a New Project](#step-2-create-a-new-project).

- <a href="https://portal.aws.amazon.com/billing/signup?redirect_url=https%3A%2F%2Faws.amazon.com%2Fregistration-confirmation#/start" target="_blank">Sign up for an AWS Account</a>
- Install <a href="https://nodejs.org/en/download/" target="_blank">Node.js®</a> and <a href="https://www.npmjs.com/get-npm" target="_blank">npm</a> if they are not already on your machine.

Verify that you are running at least Node.js version 8.x or greater and npm version 5.x or greater by running `node -v` and `npm -v` in a terminal/console window.
{: .callout .callout--action}

- Install and configure the Amplify CLI.

```bash
$ npm install -g @aws-amplify/cli
$ amplify configure
```

## Step 2. Create a New Project

<div class="nav-tab create" data-group='create'>
<ul class="tabs">
    <li class="tab-link purejs current" data-tab="purejs">JavaScript</li>
    <li class="tab-link react" data-tab="react">React</li>
    <li class="tab-link react-native" data-tab="react-native">React Native</li>
    <li class="tab-link angular" data-tab="angular">Angular</li>
    <li class="tab-link ionic" data-tab="ionic">Ionic</li>
</ul>

If you have an existing application you can skip ahead, [Step 3. Install AWS Amplify](#step-3-install-aws-amplify). 

<div id="purejs" class="tab-content current">

For this example we will create a new plain JavaScript <a href="https://babeljs.io/docs/en/learn/" target="_blank">ES2015</a> app that uses webpack. Create a new project directory called `amplify-js-app`.

Change directories to your new project and run:

```
$ mkdir amplify-js-app amplify-js-app/src
$ cd amplify-js-app
$ touch package.json index.html webpack.config.js src/app.js
```

Your project directory structure should now be:

```
- amplify-js-app
    - index.html
    - package.json
    - webpack.config.js
    - /src
        |- app.js
```

Replace the `package.json` contents with the following:

```js
{
  "name": "amplify-js-app",
  "version": "1.0.0",
  "description": "AWS Amplify JavaScript Example",
  "dependencies": {},
  "devDependencies": {
    "webpack": "^4.17.1",
    "webpack-cli": "^3.1.0",
    "copy-webpack-plugin": "^4.5.2",
    "webpack-dev-server": "^3.1.5"
  },
  "scripts": {
    "start": "webpack-dev-server",
    "build": "webpack"
  }
}

```

Install the local development dependencies:

```
$ npm install
```

Add the following to the `index.html` file:

```html
<!doctype html>
<html lang="en">
    <head>
        <meta charset="utf-8">
        <title>AWS Amplify with webpack and ES2015</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
    </head>
    <body>
        <h1>AWS Amplify</h1>
        <script src="dist/bundle.js"></script>
    </body>
</html>
```

Add the following to the `webpack.config.js` file:

```js
const CopyWebpackPlugin = require('copy-webpack-plugin')

module.exports = {
    mode: 'development',
    entry: './src/app.js',
    output: {
        filename: 'bundle.js'
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/
            }
        ]
    },
    plugins: [
        new CopyWebpackPlugin(['index.html'])
    ]
};
```

Run your app:

```bash
$ npm start
```

Your app should now be available at <a href="http://localhost:8080" target="_blank">http://localhost:8080</a>

</div>

<div id="react" class="tab-content">

Use [Create React App](https://github.com/facebookincubator/create-react-app) to boostrap your application.

```bash
create-react-app my-app
cd my-app
npm start
```

</div>
<div id="react-native" class="tab-content" >

If you have an existing React Native application, you can skip this section, but note that we have a [linking requirement](#linking-native-libraries-for-react-native) that may apply to your app.

[Create React Native App (CRNA)](https://github.com/react-community/create-react-native-app) is a command line utility to Create React Native apps with no build configuration. Run following commands to install CRNA and create your app:

```bash
$ npm install -g create-react-native-app
$ create-react-native-app myAmplifyProject
$ cd myAmplifyProject
```

The project name is in camelCase to avoid problems when testing on a physical iOS phone.
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
$ npm install -g ionic
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
    <li class="tab-link purejs current" data-tab="purejs">JavaScript</li>
    <li class="tab-link react" data-tab="react">React</li>
    <li class="tab-link react-native" data-tab="react-native">React Native</li>
</ul>
<div id="purejs" class="tab-content current">

```bash
$ npm install --save aws-amplify
```

</div>
<div id="react" class="tab-content">

```bash
$ npm install --save aws-amplify
```

In addition to *aws-amplify*, we provide react-specific components in *aws-amplify-react*.

```bash
$ npm install --save aws-amplify-react
```
</div>
<div id="react-native" class="tab-content">
```bash
$ npm install --save aws-amplify
```
In addition to *aws-amplify*, we provide React Native specific components in `aws-amplify-react-native` package.

```bash
$ npm install --save aws-amplify-react-native
```

If you have created your app with *create-react-native-app* in previous steps, you can [**skip**](#step-4-set-up-your-backend) this section.

AWS Amplify provides native libraries for React Native to support Amazon Cognito sign-in process. If you are using *create-react-native-app* or [Expo v25.0.0 or greater](https://blog.expo.io/expo-sdk-v25-0-0-is-now-available-714d10a8c3f7), those libraries are already included in your dependencies. Otherwise, you need to [link](https://facebook.github.io/react-native/docs/linking-libraries-ios.html) those libraries to your project.
{: .callout .callout--info}

Following example shows how you can link the libraries for a project that is created with *react-native init*:

```bash
$ react-native init myReactNativeApp
$ cd myReactNativeApp
$ npm install --save aws-amplify
$ npm install --save aws-amplify-react-native
$ react-native link
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

</div>
<div id="ionic" class="tab-content">
```bash
$ npm install --save aws-amplify-angular
``` 

See the [Ionic Guide](https://aws-amplify.github.io/amplify-js/media/ionic_guide){: target='_new'} for details and usage.
{: .callout .callout--action}

</div>
</div>

## Step 4. Set up Your Backend

You can quickly create your backend from scratch with Automatic Setup, or use Manual Setup to integrate AWS resources you have already configured.

`amplify init` creates a backend project for your app and pulls the service configuration into your project. 

```
$ amplify init
? Choose your default editor: << choose-your-preferred editor >>
? Choose the type of app that you're building javascript
Please tell us about your project
? What javascript framework are you using angular
? Source Directory Path: src
? Distribution Directory Path: dist/myAngularProject
? Build Command: npm run-script build
? Start Command: ng serve
```

> When you run `amplify init` command you are asked for the details of your project. A configuration file for your app is put in your configured source directory called `aws-exports.js`.

Update the `src/app.js` file:

```js
import Amplify from 'aws-amplify';
import awsmobile from './aws-exports';
Amplify.configure(awsmobile)

// Optionally add Debug Logging
Amplify.Logger.LOG_LEVEL = 'DEBUG';

```

### Add Backend Features

You can  use the `amplify add` command with the respective category name to add backend features:

```bash
$ amplify add <category-name>
```

Run `amplify` on your CLI at anytime to see available categories.

```terminal
| Category      |
| ------------- |
| analytics     |
| api           |
| auth          |
| function      |
| hosting       |
| storage       |
| notifications |
```

For example, to enable static web hosting for your app:

```bash
$ amplify add hosting
```

Then, publish your app:

```bash
$ amplify publish
```

🎉 Congratulations! Your app is now integrated with AWS Amplify and hosted on Amazon S3. <br/>Some next Steps:

 - Add [Analytics]({%if jekyll.environment == 'production'%}{{site.amplify.docs_baseurl}}{%endif%}/media/analytics_guide)
 - Add [Authentication]({%if jekyll.environment == 'production'%}{{site.amplify.docs_baseurl}}{%endif%}/media/authentication_guide)
 - Add a GraphQL or REST [API]({%if jekyll.environment == 'production'%}{{site.amplify.docs_baseurl}}{%endif%}/media/api_guide)

#### Existing AWS Resources

If you want to use your existing AWS resources with your app you will need to **manually configure** your app with your current credentials in your code, for example:

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
To see the configuration parameters for existing AWS resources, see the *Existing AWS Resources* section in AWS Amplify Developer Guide for each individual service:
[Amazon Cognito]({%if jekyll.environment == 'production'%}{{site.amplify.docs_baseurl}}{%endif%}/media/authentication_guide#manual-setup),
[Amazon S3]({%if jekyll.environment == 'production'%}{{site.amplify.docs_baseurl}}{%endif%}/media/storage_guide#manual-setup),
[Amazon Pinpoint]({%if jekyll.environment == 'production'%}{{site.amplify.docs_baseurl}}{%endif%}/media/analytics_guide#manual-setup),
[Amazon API Gateway]({%if jekyll.environment == 'production'%}{{site.amplify.docs_baseurl}}{%endif%}/media/api_guide#manual-setup)
{: .callout .callout--info}

##### AWS SDK Interfaces

For working with other AWS services you can use service interface objects directly via the JavaScript SDK clients. 

To work with service interface objects, your Amazon Cognito users' [IAM role](https://docs.aws.amazon.com/cognito/latest/developerguide/iam-roles.html) must have the appropriate permissions to call the requested services.
{: .callout .callout--warning}

You can call methods on any AWS Service interface object supported by the <a href="https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/_index.html" target="_blank">AWS JavaScript SDK</a> by passing your credentials from *Auth* to the service call constructor. For example, to use Amazon Route53 in your app:

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
