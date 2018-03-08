---
# Page settings
layout: default
---

# Installation and Configuration

Installing AWS Amplify involves installing our client libraries from `npm`, and configuring your backend to connect to services.

## Install client libraries

<div class="nav-tab install" data-group="install">
<ul class="tabs">
    <li class="tab-link javascript current" data-tab="javascript">JavaScript</li>
    <li class="tab-link react" data-tab="react">React</li>
    <li class="tab-link react-native" data-tab="react-native">React Native</li>
</ul>
<div id="javascript" class="tab-content current">
For JavaScript web development, regardless of the frontend framework used, `aws-amplify` package provides core APIs
```bash
npm install aws-amplify
```
</div>
<div id="react" class="tab-content">
On a React app, in addition to `aws-amplify`, we provide helpers and higher order components that are packaged in `aws-amplify-react`
```bash
npm install aws-amplify
```
```bash
npm install aws-amplify-react
```
</div>
<div id="react-native" class="tab-content">
For React Native, in addition to `aws-amplify`, we provide React Native specific components with `aws-amplify-react-native` package
```bash
npm install aws-amplify
```
```bash
npm install aws-amplify-react-native
```
</div>
</div>

## Set up your Backend

AWS Amplify connects to [AWS Mobile Hub](https://aws.amazon.com/mobile/) to work with Amazon Web Services. AWS Mobile Hub gives you a single place to easily configure AWS service and automatically provisions the AWS services required for the features in your app.

Check our [Quick Start Guide](/media/quick_start/index.html#set-up-your-backend) to see how you can set up your backend.
{: .next-link}

## Connect to Your Backend

Connecting to your backend requires loading the required configuration in your app with `Amplify.configure()` method.

Check our [Quick Start Guide](/media/quick_start/index.html#connect-to-your-backend) to see how you can connect to your backend.
{: .next-link}

 

