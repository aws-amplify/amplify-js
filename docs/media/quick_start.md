---
---

# Getting Started

This page is a guide to quickly build a cloud-powered mobile or web app with AWS Amplify. AWS Amplify includes:
- a JavaScript library with support for React Native and web frameworks including <br/>React, Angular, and Ionic
- a style guide including UI components
- the Amplify CLI with support for managing the serverless backend, web hosting, and codegen

Use the drop-down menu at the top right of this page to choose the framework for your app.

## Step 0. Development Environment 

Install the Amplify CLI. If you have already installed the CLI, skip ahead to [Step 1. Create a New App](#step-1-create-a-new-app).

- <a href="https://portal.aws.amazon.com/billing/signup?redirect_url=https%3A%2F%2Faws.amazon.com%2Fregistration-confirmation#/start" target="_blank">Sign up for an AWS Account</a>
- Install <a href="https://nodejs.org/en/download/" target="_blank">Node.js®</a> and <a href="https://www.npmjs.com/get-npm" target="_blank">npm</a> if they are not already on your machine.

Verify that you are running at least Node.js version 8.x or greater and npm version 5.x or greater by running `node -v` and `npm -v` in a terminal/console window.
{: .callout .callout--action}

- Install and configure the Amplify CLI.

```bash
$ npm install -g @aws-amplify/cli
$ amplify configure
```

Note: These commands will install the CLI globally. If you're using Windows, the CLI currently supports <a href="https://docs.microsoft.com/en-us/windows/wsl/install-win10" target="_blank">Windows Subsystem for Linux</a>.
{: .callout .callout--action}

## Step 1. Create a New App

<div class="nav-tab create" data-group='create'>
<ul class="tabs">
    <li class="tab-link purejs current" data-tab="purejs">JavaScript</li>
    <li class="tab-link react" data-tab="react">React</li>
    <li class="tab-link react-native" data-tab="react-native">React Native</li>
    <li class="tab-link angular" data-tab="angular">Angular</li>
    <li class="tab-link ionic" data-tab="ionic">Ionic</li>
</ul>

<div id="purejs" class="tab-content current">

Create a new ‘plain’ JavaScript <a href="https://babeljs.io/docs/en/learn/" target="_blank">ES2015</a> app with webpack. With the following commands, create the directory (`amplify-js-app`) and files for the app.

```
$ mkdir -p amplify-js-app/src && cd amplify-js-app
$ touch package.json index.html webpack.config.js src/app.js
```

The app directory structure should be:

```
- amplify-js-app
    - index.html
    - package.json
    - webpack.config.js
    - /src
        |- app.js
```

Add the following to the `package.json` file:

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
    "start": "webpack && webpack-dev-server --mode development",
    "build": "webpack"
  }
}

```

Install local development dependencies:

```
$ npm install
```

Add the following to the `index.html` file:

```html
<!doctype html>
<html lang="en">
    <head>
        <meta charset="utf-8">
        <title>AWS Amplify</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
            html, body { font-family: "Amazon Ember", "Helvetica", "sans-serif"; margin: 0; }
            a { color: #FF9900; }
            h1 { font-weight: 300; }
            .app { width: 100%; }
            .app-header { color: white; text-align: center; background: linear-gradient(30deg, #f90 55%, #FFC300); width: 100%; margin: 0 0 1em 0; padding: 3em 0 3em 0; box-shadow: 1px 2px 4px rgba(0, 0, 0, .3); }
            .app-logo { width: 126px; margin: 0 auto; }
            .app-body { width: 400px; margin: 0 auto; text-align: center; }
            .app-body button { background-color: #FF9900; font-size: 14px; color: white; text-transform: uppercase; padding: 1em; border: none; }
            .app-body button:hover { opacity: 0.8; }
        </style>
    </head>
    <body>
        <div class="app">
            <div class="app-header">
                <div class="app-logo">
                    <img src="https://aws-amplify.github.io/images/Logos/Amplify-Logo-White.svg" alt="AWS Amplify" />
                </div>
                <h1>Welcome to AWS Amplify</h1>
            </div>
            <div class="app-body">
                <button id="AnalyticsEventButton">Generate Analytics Event</button>
                <div id="AnalyticsResult"></div>
            </div>
        </div>
        <script src="main.bundle.js"></script>
    </body>
</html>
```

Add the following to the `webpack.config.js` file:

```js
const CopyWebpackPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');
const path = require('path');

module.exports = {
    mode: 'development',
    entry: './src/app.js',
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, 'dist')
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/
            }
        ]
    },
    devServer: {
        contentBase: './dist',
        overlay: true,
        hot: true
    },
    plugins: [
        new CopyWebpackPlugin(['index.html']),
        new webpack.HotModuleReplacementPlugin()
    ]
};
```

Run the app:

```bash
$ npm start
```

Open a browser and navigate to <a href="http://localhost:8080" target="_blank">http://localhost:8080</a>. The 'Generate Analytics Event' button does not work yet. We'll work on that next.

</div>

<div id="react" class="tab-content">

Use [Create React App](https://github.com/facebookincubator/create-react-app) to boostrap your application.

```bash
$ npm install -g create-react-app
$ create-react-app myapp && cd myapp
$ npm start
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

## Step 2. Install Amplify 

In a terminal window, change to the root directory of your app and run the following command:

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

To install React specific components, run the following command:

```bash
$ npm install --save aws-amplify-react
```
</div>
<div id="react-native" class="tab-content">
```bash
$ npm install --save aws-amplify
```
To install React Native specific components, run the following command:

```bash
$ npm install --save aws-amplify-react-native
```

If you have created your app with *create-react-native-app* in previous steps, you can [**skip**](#step-3-set-up-the-app-backend) this section.

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

In addition to `aws-amplify` core, you can install our angular and ionic modules which provide a service provider, helpers, and components:

</div>
<div id="ionic" class="tab-content">
```bash
$ npm install --save aws-amplify-angular
$ npm install --save ionic-angular
``` 

See the [Ionic Guide](https://aws-amplify.github.io/amplify-js/media/ionic_guide){: target='_new'} for details and usage.
{: .callout .callout--action}

</div>
</div>

## Step 3. Set up the AWS Backend

<div class="nav-tab setup" data-group='setup'>
<ul class="tabs">
    <li class="tab-link purejs current" data-tab="purejs">JavaScript</li>
    <li class="tab-link react" data-tab="react">React</li>
    <li class="tab-link react-native" data-tab="react-native">React Native</li>
    <li class="tab-link angular" data-tab="angular">Angular</li>
    <li class="tab-link ionic" data-tab="ionic">Ionic</li>
</ul>

Create new AWS backend resources and pull the AWS services configuration into the app. In a terminal window, change to the root directory of your app and run the following command (for this app, accepting all defaults is OK):

```bash
$ amplify init
```

<div id="angular" class="tab-content">
> When asked for the distribution directory (the directory that will be uploaded to S3), answer `dist/MyAngularApp`. If you did not use the name in this tutorial, change "MyAngularApp" with the name of your application. You can run an `ng build` and check your `dist` directory to see what the name is and re-run `amplify configure project` to change your dist directory setting.
</div>

**Create the Required AWS Backend Resources**

Add one or more cloud services to the app using the `amplify add <category-name>` command. Run `amplify` in the terminal to list available categories (services are organized in categories).

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

Add analytics to the app with the following command (accepting all defaults is OK):

```bash
$ amplify add analytics
```

Create the AWS backend resources and update the aws-exports.js file.

```bash
$ amplify push
```

> A configuration file (`aws-exports.js`) will be added to the source directory.

## Step 4. Integrate AWS Resources

<div class="nav-tab install" data-group='install'>
<ul class="tabs">
    <li class="tab-link angular" data-tab="angular">Angular</li>
    <li class="tab-link ionic" data-tab="ionic">Ionic</li>
    <li class="tab-link purejs current" data-tab="purejs">JavaScript</li>
    <li class="tab-link react" data-tab="react">React</li>
    <li class="tab-link react-native" data-tab="react-native">React Native</li>
</ul>

<div id="purejs" class="tab-content current">

Add the following to the `src/app.js` file:

```js
import Auth from '@aws-amplify/auth';
import Analytics from '@aws-amplify/analytics';

import awsconfig from './aws-exports';

// retrieve temporary AWS credentials and sign requests
Auth.configure(awsconfig);
// send analytics events to Amazon Pinpoint
Analytics.configure(awsconfig);

const AnalyticsResult = document.getElementById('AnalyticsResult');
const AnalyticsEventButton = document.getElementById('AnalyticsEventButton');
let EventsSent = 0;
AnalyticsEventButton.addEventListener('click', (evt) => {
    Analytics.record('AWS Amplify Tutorial Event')
        .then( (evt) => {
            const url = 'https://console.aws.amazon.com/pinpoint/home/?region=us-east-1#/apps/'+awsconfig.aws_mobile_analytics_app_id+'/analytics/events';
            AnalyticsResult.innerHTML = '<p>Event Submitted.</p>';
            AnalyticsResult.innerHTML += '<p>Events sent: '+(++EventsSent)+'</p>';
            AnalyticsResult.innerHTML += '<a href="'+url+'" target="_blank">View Events on the Amazon Pinpoint Console</a>';
        });
});
```

> The code above imports only the Auth and Analytics categories. To import the entire Amplify library use `import Amplify from 'aws-amplify'`. However, importing only the required categories is recommended as it will greatly reduce the final bundle size.

</div>

<div id="react" class="tab-content">
Change your `src/App.js` file to the following:

```js
import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import Auth from '@aws-amplify/auth';
import Analytics from '@aws-amplify/analytics';

import awsconfig from './aws-exports';

// retrieve temporary AWS credentials and sign requests
Auth.configure(awsconfig);
// send analytics events to Amazon Pinpoint
Analytics.configure(awsconfig);

class App extends Component {
  constructor(props) {
    super(props);
    this.handleAnalyticsClick = this.handleAnalyticsClick.bind(this);
    this.state = {analyticsEventSent: false, resultHtml: "", eventsSent: 0};
  }

  handleAnalyticsClick() {
      Analytics.record('AWS Amplify Tutorial Event')
        .then( (evt) => {
            const url = 'https://console.aws.amazon.com/pinpoint/home/?region=us-east-1#/apps/'+awsconfig.aws_mobile_analytics_app_id+'/analytics/events';
            let result = (<div>
              <p>Event Submitted.</p>
              <p>Events sent: {++this.state.eventsSent}</p>
              <a href={url} target="_blank">View Events on the Amazon Pinpoint Console</a>
            </div>);
            this.setState({
                'analyticsEventSent': true,
                'resultHtml': result
            });
        });
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>
        <div className="App-intro">
          <button className="App-button" onClick={this.handleAnalyticsClick}>Generate Analytics Event</button>
          {this.state.analyticsEventSent}
          <div>{this.state.resultHtml}</div>
        </div>
      </div>
    );
  }
}

export default App;
```

> The code above imports only the Auth and Analytics categories. To import the entire Amplify library use `import Amplify from 'aws-amplify'`. However, importing only the required categories is recommended as it will greatly reduce the final bundle size.
</div>

<div id="react-native" class="tab-content">
Change your `src/App.js` file to the following:

```js
import React from 'react';
import { Linking, Button, StyleSheet, Text, View } from 'react-native';
import Auth from '@aws-amplify/auth';
import Analytics from '@aws-amplify/analytics';

import awsconfig from './aws-exports';

// retrieve temporary AWS credentials and sign requests
Auth.configure(awsconfig);
// send analytics events to Amazon Pinpoint
Analytics.configure(awsconfig);

export default class App extends React.Component {
    constructor(props) {
      super(props);
      this.handleAnalyticsClick = this.handleAnalyticsClick.bind(this);
      this.state = {resultHtml: <Text></Text>, eventsSent: 0};
    }

    handleAnalyticsClick() {
      Analytics.record('AWS Amplify Tutorial Event')
        .then( (evt) => {
            const url = 'https://console.aws.amazon.com/pinpoint/home/?region=us-east-1#/apps/'+awsconfig.aws_mobile_analytics_app_id+'/analytics/events';
            let result = (
              <View>
                <Text>Event Submitted.</Text>
                <Text>Events sent: {++this.state.eventsSent}</Text>
                <Text style={styles.link} onPress={() => Linking.openURL(url)}>
                  View Events on the Amazon Pinpoint Console
                </Text>
              </View>
            );
            this.setState({
                'resultHtml': result
            });
        });
    };

    render() {
      return (
        <View style={styles.container}>
          <Text>Welcome to your React Native App with Amplify!</Text>
          <Button title="Generate Analytics Event" onPress={this.handleAnalyticsClick} />
          {this.state.resultHtml}
        </View>
      );
    }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  link: {
    color: 'blue'
  }
});
```

> The code above imports only the Auth and Analytics categories. To import the entire Amplify library use `import Amplify from 'aws-amplify'`. However, importing only the required categories is recommended as it will greatly reduce the final bundle size.
</div>

<div id="angular" class="tab-content">
After creating your backend a configuration file will be generated in your configured source directory you identified in the `amplify init` command.

Import the configuration file and load it in `main.ts`: 

```js
import Amplify from 'aws-amplify';
import amplify from './aws-exports';
Amplify.configure(amplify);
```

Depending on your TypeScript version you may need to rename the `aws-exports.js` to `aws-exports.ts` prior to importing it into your app, or enable the `allowJs` <a href="https://www.typescriptlang.org/docs/handbook/compiler-options.html" target="_blank">compiler option</a> in your tsconfig. 
{: .callout .callout--info}

When working with underlying `aws-js-sdk`, the "node" package should be included in *types* compiler option. update your `src/tsconfig.app.json`:
```json
"compilerOptions": {
    "types" : ["node"]
}
```

In your [app module](https://angular.io/guide/bootstrapping) `src/app/app.module.ts`, change your code to the following:

```js
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { AmplifyAngularModule, AmplifyService } from 'aws-amplify-angular';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    CommonModule,
    AmplifyAngularModule
  ],
  providers: [
    AmplifyService
  ],
  bootstrap: [AppComponent]
})

export class AppModule { }
```

This imports the Amplify Module and Service.

Note: If you are using Angular 6, you may need to add the following to the top of your `src/polyfills.ts` file: ```(window as any).global = window;```.
{: .callout .callout--info}

In your `src/app/app.component.ts` file, add the following import statements:

```js
import { AmplifyService } from 'aws-amplify-angular';
import awsconfig from '../aws-exports';
```

To add the analytics event recorder to your app, replace your ```AppComponent``` class with the following:
```js
export class AppComponent {
  title = 'amplify-angular-app';
  url = 'https://console.aws.amazon.com/pinpoint/home/?region=us-east-1#/apps/'
        + awsconfig.aws_mobile_analytics_app_id + '/analytics/events';
  eventsSent = 0;
  analyticsEventSent = false;

  constructor( private amplifyService: AmplifyService ) {}

  handleAnalyticsClick() {
    this.amplifyService.analytics().record('AWS Amplify Tutorial Event')
    .then( (evt) => {
        ++this.eventsSent;
        this.analyticsEventSent = true;
    });
  }
}
```

Then, add the following to your `src/app/app.component.html` file:
```html
<button (click)="handleAnalyticsClick()">Generate Analytics Event</button>
<div *ngIf="analyticsEventSent">
  <p>Event Submitted.</p>
  <p>Events sent: {% raw %}{{ eventsSent }}{% endraw %}</p>
  <a href="{% raw %}{{ url }}{% endraw %}" target="_blank">View Events on the Amazon Pinpoint Console</a>
</div>
```
</div>

<div id="ionic" class="tab-content">
After creating your backend, the configuration file is copied to `/amplify/#current-cloud-backend/aws-exports.js`, and the source folder you have identified in the `amplify init` command.

To import the configuration file to your Ionic app, you will need to rename `aws_exports.js` to `aws_exports.ts`. You should make sure that your `package.json` scripts also rename the file upon build, so that any configuration changes which result in the download of an `aws_exports.js` from AWS Mobile Hub get changed over to the ts extension.
```js	
"scripts": {	
    "start": "[ -f src/aws-exports.js ] && mv src/aws-exports.js src/aws-exports.ts || ng serve; ng serve",	
    "build": "[ -f src/aws-exports.js ] && mv src/aws-exports.js src/aws-exports.ts || ng build --prod; ng build --prod"	
}	
```

Import the configuration file and load it in your `main.ts`, which is the entry point of your Angular application. 

```js
import Amplify from 'aws-amplify';
import amplify from './aws-exports';
Amplify.configure(amplify);
```

In your [app module](https://angular.io/guide/bootstrapping) `src/app/app.module.ts`, change your code to the following:

```js
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule, RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CommonModule } from '@angular/common';
import { AmplifyAngularModule, AmplifyService } from 'aws-amplify-angular';

@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [BrowserModule, IonicModule.forRoot(), AppRoutingModule, AmplifyAngularModule],
  providers: [
    StatusBar,
    SplashScreen,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    AmplifyService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
```

This imports the Amplify Module and Service.

Note: If you are using Angular 6, you may need to add the following to the top of your `src/polyfills.ts` file: ```(window as any).global = window;```.
{: .callout .callout--info}

In your `src/app/app.component.ts` file, add the following import statements:

```js
import { AmplifyService } from 'aws-amplify-angular';
import awsconfig from '../aws-exports';
```

To add the analytics event recorder to your app, replace your ```AppComponent``` class with the following:
```js
export class AppComponent {
  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    public amplifyService: AmplifyService
  ) {
    this.amplifyService = amplifyService;
    this.initializeApp();
  }

  url = 'https://console.aws.amazon.com/pinpoint/home/?region=us-east-1#/apps/'
        + awsconfig.aws_mobile_analytics_app_id + '/analytics/events';
  eventsSent = 0;
  analyticsEventSent = false;

  handleAnalyticsClick() {
    this.amplifyService.analytics().record('AWS Amplify Tutorial Event')
    .then( (evt) => {
        ++this.eventsSent;
        this.analyticsEventSent = true;
    });
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }
}

```

Then, replace your `src/app/app.component.html` code with the following:
```html
<ion-button (click)="handleAnalyticsClick()">Generate Analytics Event</ion-button>
<div *ngIf="analyticsEventSent">
  <p>Event Submitted.</p>
  <p>Events sent: {{ eventsSent }}</p>
  <a href="{{ url }}" target="_blank">View Events on the Amazon Pinpoint Console</a>
</div>
```
</div>

## Step 5. Host your App

Enable static web hosting for the app on Amazon S3. In a terminal window, change to the root directory of your app and run the following command:

```bash
$ amplify add hosting
```

Run the following command to publish the app:

```bash
$ amplify publish
```

Open the app in a browser window and push the button to generate analytics events. In the Pinpoint console, open the dashboard for the app and monitor incoming events (there is a short delay before events are visible in the dashboard). 

At any time, run the following command in the app directory, to get details of all resources and resource IDs used by the app:

```bash
$ amplify status
```

🎉 Congratulations! Your app is built, published, and hosted on Amazon S3.

What next? Here are some things to add to your app:
 - Add [Authentication]({%if jekyll.environment == 'production'%}{{site.amplify.docs_baseurl}}{%endif%}/media/authentication_guide)
 - Add [Data]({%if jekyll.environment == 'production'%}{{site.amplify.docs_baseurl}}{%endif%}/media/api_guide) with serverless GraphQL


**Existing AWS Resources**

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


**AWS SDK Interfaces**

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