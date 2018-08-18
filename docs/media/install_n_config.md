---
# Page settings
layout: default
---

# Installation and Configuration for JavaScript

Installing AWS Amplify involves installing our client libraries and toolchain with *npm*, and configuring your backend to connect to services.

## Prerequisites

To work with AWS Amplify;
- You need to have an AWS account. If you don't already have an AWS account [Sign up for the AWS Free Tier](https://portal.aws.amazon.com/billing/signup?redirect_url=https%3A%2F%2Faws.amazon.com%2Fregistration-confirmation#/start).
- Install Node.js® with NPM

## Step 1 - Install the CLI

AWS Amplify CLI enables adding cloud features to your app easily by provisioning the backend resources.

```bash
$ npm install -g @aws-amplify/cli
```

## Step 2 - Install Client Libraries

You can use AWS Amplify with plan JavaScript or install frontend library support packages to use UI components and many other utilities.

<div class="nav-tab install" data-group="install">
<ul class="tabs">
    <li class="tab-link javascript current" data-tab="javascript">JavaScript</li>
    <li class="tab-link angular" data-tab="angular">Angular and Ionic</li>
    <li class="tab-link react" data-tab="react">React</li>
    <li class="tab-link react-native" data-tab="react-native">React Native</li>
</ul>
<div id="javascript" class="tab-content current">
For JavaScript development, regardless of the frontend framework used, *'aws-amplify'* package provides core APIs:

```bash
npm install aws-amplify
```
</div>
<div id="react" class="tab-content">
On a React app, in addition to  *'aws-amplify'*, we provide helpers and higher order components that are packaged in  *'aws-amplify-react'*.

```bash
npm install aws-amplify
npm install aws-amplify-react
```

</div>
<div id="react-native" class="tab-content">
For React Native, in addition to *'aws-amplify'*, we provide React Native specific components with *'aws-amplify-react-native*' package:

```bash
npm install aws-amplify
npm install aws-amplify-react-native
```

</div>
<div id="angular" class="tab-content">
For Angular, in addition to *'aws-amplify'*, we provide an Angular module with a service provider and components in the *'aws-amplify-angular'* package:

```bash
npm install aws-amplify
npm install aws-amplify-angular
```
</div>
</div>

## Step 3 - Initialize Your JavaScript Project

To start working with AWS Amplify, you need to initialize your project's backend with the CLI. This is a required one-time setup that creates your initial backend resources in the cloud and makes your project ready to integrate additional cloud resources.

You should run all *amplify* commands at *root folder* of your project.
{: .callout .callout--info}


In your project's *root folder*, run following command to initialize your backend:

```bash
$ cd my-app #Change to your project's root folder
$ amplify init
```

When you run *'amplify init'* in your project folder for the first time, the CLI will ask you some options to configure your development environment. Select `JavaScript` when prompted for the app platform:

```bash
? Please choose the type of app that you're building (Use arrow keys)
  android 
  ios 
❯ javascript 
```

Initializing a project creates the backend configuration file `aws-exports.js` which you will import in your app to use Amplify categories. This file needs to be under your source directory. If you are starting a new project, please be sure to have a source directory, e.g. '/src' and select this directory when prompted by the *init* command.

## What's next?  

Check our [Get Started Guide]({%if jekyll.environment == 'production'%}{{site.amplify.baseurl}}{%endif%}/media/quick_start#set-up-your-backend) to see how you can set up your backend and use it in you app.
{: .next-link}


