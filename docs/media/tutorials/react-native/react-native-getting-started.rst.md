Get Started
===========

Overview
--------

The AWS Mobile CLI provides a command line experience that allows
frontend JavaScript developers to quickly create and integrate AWS
backend resources into their mobile apps.

Prerequisites
-------------

1.  [Sign up for the AWS Free Tier](https://aws.amazon.com/free/) to
    learn and prototype at little or no cost.
2.  Install [Node.js](https://nodejs.org/en/download/) with NPM.
3.  Install the AWS Mobile CLI

    ``` {.sourceCode .bash}
    npm install --global awsmobile-cli
    ```

4.  Configure the CLI with your AWS credentials

    To setup permissions for the toolchain used by the CLI, run:

    ``` {.sourceCode .bash}
    awsmobile configure
    ```

    If prompted for credentials, follow the steps provided by the CLI.
    For more information, see
    Provide IAM credentials to AWS Mobile CLI &lt;aws-mobile-cli-credentials&gt;.

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
    ? Where is your projects's source directory:  /
    ```

    Then respond to further prompts with the following values.

    ``` {.sourceCode .bash}
    Please tell us about your project:
    ? Where is your project's source directory:  /
    ? Where is your project's distribution directory that stores build artifacts:  build
    ? What is your project's build command:  npm run-script build
    ? What is your project's start command for local test run:  npm run-script start
    ```

 .. \_react-native-getting-started-configure-aws-amplify:

Connect to Your Backend
-----------------------

AWS Mobile uses the open source [AWS Amplify
library](https://github.com/aws/aws-amplify) to link your code to the
AWS features configured for your app.

**To connect the app to your configured AWS services**

1.  Install AWS Amplify for React Native library.

    ``` {.sourceCode .bash}
    npm install --save aws-amplify
    ```

2.  In App.js (or in other code that runs at launch-time), add the
    following imports.

    ``` {.sourceCode .javascript}
    import Amplify from 'aws-amplify';

    import aws_exports from './YOUR-PATH-TO/aws-exports';
    ```

3.  Then add the following code.

    ``` {.sourceCode .javascript}
    Amplify.configure(aws_exports);
    ```

### Run Your App Locally

Your app is now ready to launch and use the default services configured
by AWS Mobile.

**To launch your app locally**

Use the command native to the React Native tooling you are using. For
example, if you made your app using
`create-react-native-app`{.sourceCode} then run:

``` {.sourceCode .bash}
npm run android

# OR

npm run ios
```

Anytime you launch your app,
app usage analytics are gathered and can be visualized&lt;react-native-add-analytics&gt;
in an AWS console.

Next Steps
----------

### Add Features

Add the following AWS Mobile features to your mobile app using the CLI.

> -   Analytics &lt;react-native-add-analytics&gt;
> -   User Sign-in &lt;react-native-add-user-sign-in&gt;
> -   NoSQL Database &lt;react-native-access-databases&gt;
> -   User Data Storage &lt;react-native-add-storage&gt;
> -   Cloud Logic &lt;react-native-access-apis&gt;

### Learn more

To learn more about the commands and usage of the AWS Mobile CLI, see
the AWS Mobile CLI reference&lt;aws-mobile-cli-reference&gt;.

Learn about [AWS Mobile Amplify](https://aws.github.io/aws-amplify).
