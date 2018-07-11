Add Auth / User Sign-in
=======================

Set Up Your Backend
-------------------

The AWS Mobile CLI components for user authentication include a rich,
configurable UI for sign-up and sign-in.

**To enable the Auth features**

In the root folder of your app, run:

``` {.sourceCode .java}
awsmobile user-signin enable

awsmobile push
```

Connect to Your Backend
-----------------------

The AWS Mobile CLI enables you to integrate ready-made
sign-up/sign-in/sign-out UI from the command line.

**To add user auth UI to your app**

1.  Install AWS Amplify for React Nativelibrary.

    ``` {.sourceCode .bash}
    npm install --save aws-amplify
    npm install --save aws-amplify-react-native
    ```

<!-- -->

1.  Add the following import in App.js (or other file that runs upon app
    startup):

    ``` {.sourceCode .java}
    import { withAuthenticator } from 'aws-amplify-react-native';
    ```

2.  Then change `export default App;`{.sourceCode} to the following.

    ``` {.sourceCode .java}
    export default withAuthenticator(App);
    ```

To test, run `npm start`{.sourceCode} or `awsmobile run`{.sourceCode}.

Next Steps
----------

Learn more about the AWS Mobile User Sign-in &lt;user-sign-in&gt;
feature, which uses [Amazon
Cognito](http://docs.aws.amazon.com/cognito/latest/developerguide/welcome.html).

Learn about AWS Mobile CLI &lt;aws-mobile-cli-reference&gt;.

Learn about [AWS Mobile Amplify](https://aws.github.io/aws-amplify).
