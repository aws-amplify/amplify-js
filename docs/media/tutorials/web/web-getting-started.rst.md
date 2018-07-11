Get Started
===========

Overview
--------

The AWS Mobile CLI provides a command line experience that allows
frontend JavaScript developers to quickly create and integrate AWS
backend resources into their mobile apps.

Prerequisites
-------------

1.  [Sign up for the AWS Free Tier](https://aws.amazon.com/free/).
2.  Install [Node.js](https://nodejs.org/en/download/) with NPM.
3.  Install AWS Mobile CLI

    ``` {.sourceCode .bash}
    npm install -g awsmobile-cli
    ```

4.  Configure the CLI with your AWS credentials

    To setup permissions for the toolchain used by the CLI, run:

    ``` {.sourceCode .bash}
    awsmobile configure
    ```

    If prompted for credentials, follow the steps provided by the CLI.
    For more information, see
    provide IAM credentials to AWS Mobile CLI &lt;aws-mobile-cli-credentials&gt;.

Set Up Your Backend
-------------------

**To configure backend features for your app**

1.  In the root folder of your app, run:

    ``` {.sourceCode .bash}
    awsmobile init
    ```

    The `init`{.sourceCode} command creates a backend project for your
    app. By default, analytics and web hosting are enabled in your
    backend and this configuration is automatically pulled into your app
    when you initialize.

2.  When prompted, provide the source directory for your project. The
    CLI will generate aws-exports.js in this location. This file
    contains the configuration and endpoint metadata used to link your
    frontend to your backend services.

    ``` {.sourceCode .bash}
    ? Where is your project's source directory:  src
    ```

3.  Respond to further prompts with the following values.

    ``` {.sourceCode .bash}
    ? Where is your project's distribution directory to store build artifacts:  build
    ? What is your project's build command:  npm run-script build
    ? What is your project's start command for local test run:  npm run-script start
    ? What awsmobile project name would you like to use:  YOUR-APP-NAME-2017-11-10-15-17-48
    ```

After the project is created you will get a success message which also
includes details on the path where the aws-exports.js is copied.

> ``` {.sourceCode .bash}
> awsmobile project's details logged at: awsmobilejs/#current-backend-info/backend-details.json
> awsmobile project's access information logged at: awsmobilejs/#current-backend-info/aws-exports.js
> awsmobile project's access information copied to: src/aws-exports.js
> awsmobile project's specifications logged at: awsmobilejs/#current-backend-info/mobile-hub-project.yml
> contents in #current-backend-info/ is synchronized with the latest information in the aws cloud
> ```

Your project is now initialized.

 .. \_web-getting-started-configure-aws-amplify:

Connect to Your Backend
-----------------------

AWS Mobile uses the open source [AWS Amplify
library](https://aws.github.io/aws-amplify) to link your code to the AWS
features configured for your app.

This section of the guide shows examples using a React application of
the kind output by `create-react-app`{.sourceCode} or a similar tool.

**To connect the app to your configured AWS features**

In index.js (or in other code that runs at launch-time), add the
following imports.

``` {.sourceCode .javascript}
import Amplify from 'aws-amplify';
import awsmobile from './YOUR-PATH-TO/aws-exports';
```

Then add the following code.

``` {.sourceCode .javascript}
Amplify.configure(awsmobile);
```

### Run Your App Locally

Your app is now ready to launch and use the default features configured
by AWS Mobile.

**To launch your app locally in a browser**

In the root folder of your app, run:

``` {.sourceCode .bash}
awsmobile run
```

Behind the scenes, this command runs `npm install`{.sourceCode} to
install the Amplify library and also pushes any backend configuration
changes to AWS Mobile. To run your app locally without pushing backend
changes you cou can choose to run `npm install`{.sourceCode} and then
run `npm start`{.sourceCode}.

Anytime you launch your app,
app analytics are gathered and can be visualized&lt;web-add-analytics&gt;
in an AWS console.

Next Steps
----------

### Deploy your app to the cloud

Using a simple command, you can publish your app's frontend to hosting
on a robust content distribution network (CDN) and view it in a browser.

**To deploy your app to the cloud and launch it in a browser**

In the root folder of your app, run:

``` {.sourceCode .bash}
awsmobile publish
```

To push any backend configuration changes to AWS and view content
locally, run `awsmobile run`{.sourceCode}. In both cases, any pending
changes you made to your backend configuration are made to your backend
resources.

By default, the CLI configures AWS Mobile
Hosting and Streaming &lt;hosting-and-streaming&gt; feature, that hosts
your app on [Amazon CloudFront](https://aws.amazon.com/cloudfront/) CDN
endpoints. These locations make your app highly available to the public
on the Internet and support [media file
streaming](http://docs.aws.amazon.com/mobile-hub/latest/developerguide/url-cf-dev;Tutorials.html)

You can also use a custom domain &lt;web-host-frontend&gt; for your
hosting location.

### Test Your App on Our Mobile Devices

Invoke a free remote test of your app on a variety of real devices and
see results, including screen shots.

**To invoke a remote test of your app**

In the root folder of your app, run:

``` {.sourceCode .bash}
awsmobile publish --test
```

The CLI will open the reporting page for your app in the console to show
the metrics gathered from the test devices. The device that runs the
remote test you invoke resides in [AWS Device
Farm](https://aws.amazon.com/device-farm/) which provides flexible
configuration of tests and reporting.

![image](images/web-performance-testing.png)

### Add Features

Add the following AWS Mobile features to your mobile app using the CLI.

> -   Analytics &lt;web-add-analytics&gt;
> -   User Sign-in &lt;web-add-user-sign-in&gt;
> -   NoSQL Database &lt;web-access-databases&gt;
> -   User File Storage &lt;web-add-storage&gt;
> -   Cloud Logic &lt;web-access-apis&gt;

### Learn more

To learn more about the commands and usage of the AWS Mobile CLI, see
the AWS Mobile CLI reference&lt;aws-mobile-cli-reference&gt;.

Learn about [AWS Mobile Amplify](https://aws.github.io/aws-amplify).
