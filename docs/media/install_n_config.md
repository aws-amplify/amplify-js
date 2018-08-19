---
# Page settings
layout: default
---

# Installation for JavaScript

Installation for AWS Amplify JavaScript library includes the steps for installing the client libraries, installing the CLI, and initializing your backend.

## Prerequisites

To work with AWS Amplify in JavaScript:
- You need an AWS account. If you don't have an account yet, [Sign up for the AWS Free Tier](https://portal.aws.amazon.com/billing/signup?redirect_url=https%3A%2F%2Faws.amazon.com%2Fregistration-confirmation#/start).
- You need [Node.js®](https://nodejs.org/en/download/) installed on your local development machine.

## Step 1 - Install the CLI

AWS Amplify CLI enables adding cloud features to your app easily by provisioning the backend resources.

```bash
$ npm install -g @aws-amplify/cli
```

## Step 2 - Install Client Libraries

Change to your app project's root directory before starting installations:

```bash
$ cd my-app #Change to your project's root folder
```

You can use AWS Amplify with plain JavaScript or you can install additional frontend support packages to use UI components and many other usefull functionality:

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

The next step is initializing your project's backend with the CLI. This is a required one-time setup that creates your initial backend resources in the cloud and makes your project ready to integrate cloud services.

You should run all Amplify CLI commands at *root folder* of your project. 
{: .callout .callout--info}

In your project's *root folder*, run following command to initialize your local configuration for your backend:

```bash
$ amplify init
```

When you run *'amplify init'* in your project folder for the first time, the CLI will ask you some options to configure your development environment. Please respond to the prompts accordingly.

If you are starting a new project, please be sure to have a source directory, e.g. '/src' and type this directory name when prompted by the *init* command.
{: .callout .callout--info}

### Select App Platform

Select `JavaScript` when prompted for the app platform:

```bash
? Please choose the type of app that you're building (Use arrow keys)
  android 
  ios 
❯ javascript 
```

### AWS CloudFormation Configuration

Amplify CLI utilizes AWS CloudFormation to manage your backend resources. When you are using the CLI for the first time in your project, you need to create a new AWS CloudFormation configuration. The CLI makes this process easy by providing you a default configuration option.

When prompted for the AWS CloudFormation configuration, select the default configuration by hitting *enter* at the command prompt:

```terminal
Amplify uses AWS CloudFormation default configuration.
To change this, see:
https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/setting-credentials-node.html
You can also configure the AWS CloudFormation provider on the project level and override the default.
? Do you want to setup project level configuration No
```

Initiating your project creates necessary AWS resources such as AIM roles and deployment buckets on your AWS backend.  Those resources are used by CLI to orchestrate your backend.

### Retrieve your Configuration File

The *push* CLI command updates your backend based on your local changes, and creates a new version of the backend configuration file *aws-exports.js*:

```bash
$ amplify push
```

Since you have not added any cloud services yet, the above command will create a new aws-exports.js file with no service configuration in it.

**aws-exports.js**
*aws-exports.js* file contains the configuration and endpoint metadata used to link your frontend to your backend services. This file is automatically located to the source directory, e.g. '/src' that you have provided in *init* step. You will later import this file in your JavaScript code to configure AWS Amplify library and get access to backend services.
{: .callout .callout--info}

**You are Amplify ready!**

Your AWS Amplify project is initialized! You can now add cloud services with the CLI and integrate those services in your JavaScript code with AWS Amplify library.

## What's next?  

<div class='installation_default_next_step'>
  Check our [Get Started Guide]({%if jekyll.environment == 'production'%}{{site.amplify.baseurl}}{%endif%}/media/quick_start#set-up-your-backend) to see how you can set up your backend and use it in you app.
  {: .next-link}
</div>

<div class='installation_custom_next_step next-link'>
</div>




 


