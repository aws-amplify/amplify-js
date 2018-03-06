---
# Page settings
layout: default
---

# Authentication

AWS Amplify Authentication module provides Authentication APIs and building blocks for developers who want to create user authentication experiences. 

Depending on your needs, you can integrate Authentication module at different levels. You can use use pre-build UI components for common sing-in/registration scenarios, or you can create your own custom user experience with the API.

## Installation and Configuration

Please refer to [AWS Amplify Installation Guide](/media/install_n_config/index.html) for general setup. Here is how you can enable Authentication category for your app.

### Automated Setup

To create a project fully functioning with the Auth category.

```bash
$ npm install -g awsmobile-cli
$ cd my-app #Change to your project's root folder
$ awsmobile init
$ awsmobile enable user-signin
$ awsmobile push
```

Import the automatically generated configuration file `aws-exports.js` in your app:

```js
import Amplify, { Auth } from 'aws-amplify';
import aws_exports from './aws-exports';
Amplify.configure(aws_exports);
```

### Manual Setup

With manual setup, you need to use your AWS Resource credentials to configure your app:

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
    // OPTIONAL - Enforce user authentication prior to accessing AWS resources or not
        mandatorySignIn: false,
    // OPTIONAL - Configuration for cookie storage
        cookieStorage: {
        // REQUIRED - Cookie domain (only required if cookieStorage is provided)
            domain: '.yourdomain.com',
        // OPTIONAL - Cookie path
            path: '/',
        // OPTIONAL - Cookie expiration in days
            expires: 365,
        // OPTIONAL - Cookie secure flag
            secure: true
        }
    }
});
```

## Integration

### Common Use Cases

AWS Amplify Authentication module exposes set of APIs to be used in any JavaScript framework. Please check [AWS Amplify API Reference](/api/classes/authclass.html) for full API list. 

Here, we provide examples for most common authentication use cases:

#### Sign In
```js
import { Auth } from 'aws-amplify';
import './aws-exports' // <-- use this if you used the cli to bootstrap your project

Auth.signIn(username, password)
    .then(user => console.log(user))
    .catch(err => console.log(err));

// If MFA enabled, keep the user object from sign in, collect confirmation code, and then
Auth.confirmSignIn(user, code)
    .then(data => console.log(data))
    .catch(err => console.log(err));
```

#### Sign Up
```js
import { Auth } from 'aws-amplify';

Auth.signUp({
        username,
        password,
        attributes: {
            email,          // optional
            phone_number,   // optional - E.164 number convention
            // other custom attributes
        },
        validationData: []  //optional
    })
    .then(data => console.log(data))
    .catch(err => console.log(err));

// Collect confirmation code, then
Auth.confirmSignUp(username, code)
    .then(data => console.log(data))
    .catch(err => console.log(err));
```

#### Sign Out
```js
import { Auth } from 'aws-amplify';

Auth.signOut()
    .then(data => console.log(data))
    .catch(err => console.log(err));
```

#### Change password
```js
import { Auth } from 'aws-amplify';

Auth.currentAuthenticatedUser()
    .then(user => {
        return Auth.changePassword(user, 'oldPassword', 'newPassword');
    })
    .then(data => console.log(data))
    .catch(err => console.log(err));
```

#### Forgot Password
```js
import { Auth } from 'aws-amplify';

Auth.forgotPassword(username)
    .then(data => console.log(data))
    .catch(err => console.log(err));

// Collect confirmation code and new password, then
Auth.forgotPasswordSubmit(username, code, new_password)
    .then(data => console.log(data))
    .catch(err => console.log(err));
```

#### Retrive Current Session

`Auth.currentSession()` returns a `CognitoUserSession` object which contains JWT `accessToken`, `idToken`, and `refreshToken`.

```js
let session = Auth.currentSession();
// CognitoUserSession => { idToken, refreshToken, accessToken }
```

### `withAuthenticator` HOC

For React and React Native apps, the simplest way to add authentication flows into your app is to use *withAuthenticator* High Order Component.

Just add these two lines to your `App.js`:

```js
import { withAuthenticator } from 'aws-amplify-react'; // or 'aws-amplify-react-native';

...

export default withAuthenticator(App);
```

Now, your app will have complete flows for user sign-in and registration. Since you have wrapped your **App** with `withAuthenticator`, only signed in users can access your app. The routing for login pages and giving access to your **App** Component will be managed automatically:

<img src="https://dha4w82d62smt.cloudfront.net/items/2R3r0P453o2s2c2f3W2O/Screen%20Recording%202018-02-11%20at%2003.48%20PM.gif" style="display: block;height: auto;width: 100%;"/>


#### Federated Identities

You can enable federated Identity login by specifying *federated* option. Here is a configuration enabling social login with multiple providers:

```js
const AppWithAuth = withAuthenticator(App);

const federated = {
    google_client_id: '',
    facebook_app_id: '',
    amazon_client_id: ''
};

ReactDOM.render(<AppWithAuth federated={federated}/>, document.getElementById('root'));
```

 NOTE: Federated Identity HOCs are not yet available on React Native.
 {: .callout .callout--info}

#### Sign Out Button

`withAuthenticator` component renders your App component after a successfull user signed in, and it prevents non sign-in uses to interact with your app. In this case, we need to display a *sign-out* button to trigger related process.

To display a sign-out button, set `includeGreetings = true` in the parameter object. It will display a *greetings section* on top of your app, and a sign-out button is displayed in authenticated state.

```js
export default withAuthenticator(App, { includeGreetings: true });
```

### Authenticator Component

The `withAuthenticator` HOC essentially just wraps `Authenticator` component. Using `Authenticator` directly gives you more customization options.

#### Example: Put App Inside Authenticator

This will render your App component with *Authenticator*:

```js
import { Authenticator } from 'aws-amplify-react'; // or 'aws-amplify-react-native'

...

class AppWithAuth extends Component {
  render(){
    return (
      <div>
      <Authenticator>
        <App />
      </Authenticator>
      </div>
    );
  }
}

export default AppWithAuth;
```

#### Example: Show your App Only After User Sign-in

In the previous example, you'll see the App is rendered even before the user is signed-in. In order to change this behaivour, you can use *Authenticator* properties. When inside `Authenticator`, the App component will receive those properties.

**authState** is the current authentication state (a string):
```
 - signIn
 - signUp
 - confirmSignIn
 - confirmSignUp
 - forgotPassword
 - verifyContact
 - signedIn
 ```

**authData** - additional data within authState; when the state is `signedIn`, it will return a `user` object.

With that, to control the condition for *Authenticator* to render App component, simply set `_validAuthStates` property:

```js
    this._validAuthStates = ['signedIn'];
```
in the component's constructor, then implement `showComponent(theme) {}` in lieu of the typical
`render() {}` method.

### Composing Your Own Authenticator

`Authenticator` is designed as a container, which contains a number of Auth components. Each component does a single job, eg: SignIn, SignUp etc.

You can compose your own Authenticator, but you must set `hideDefault={true}`.

For example, the following Authenticator only renders Greetings component which has a *Sign Out* button:

```jsx
    <Authenticator hideDefault={true}>
        <Greetings />
    </Authenticator>
```

#### Customize Greeting message

The *Greetings* component has two states: signedIn, and signedOut. To customize the greeting message, set properties `inGreeting` and `outGreeting` using a string or function.

```jsx
    <Authenticator hideDefault={true}>
        <Greetings
            inGreeting={(username) => 'Hello ' + username}
            outGreeting="Please sign in..."
        />
    </Authenticator>
```

### Write Your Own Auth UI

To customize the default auth experience even more, you can create your own auth UI. To do this, your component will leverage the following *Authenticator* properties:

```
- authState
- authData
- onStateChange
```

This example creates an 'Always On' Auth UI, which constantly shows the current auth state in your app.

```jsx
import { Authenticator, SignIn, SignUp, ConfirmSignUp, Greetings } from 'aws-amplify-react';

const AlwaysOn = (props) => {
    return (
        <div>
            <div>I am always here to show current auth state: {props.authState}</div>
            <button onClick={() => props.onStateChange('signUp')}>Show Sign Up</button>
        </div>
    )
}

handleAuthStateChange(state) {
    if (state === 'signedIn') { 
        /* Do something when the user has signed-in */ 
    }
}

render() {
    return (
        <Authenticator hideDefault={true} onStateChange={this.handleAuthStateChange}>
            <SignIn/>
            <SignUp/>
            <ConfirmSignUp/>
            <Greetings/>
            <AlwaysOn/>
        </Authenticator>
    )
}
```

### Federated Identities (Social Sign-in)


**Availibility Note**
Currently, our federated identity components only support Google, Facebook and Amazon identities, and works with React. 
Support for React Native is in progress. Please see our[ Setup Guide for Federated Identities](/media/federated_identity_setup/index.html). 
{: .callout .callout--info}


In order to enable social sign-in in your app with Federated Identities, just add `Google client_id`, `Facebook app_id` and/or `Amazon client_id` properties to *Authenticator* component:

```jsx
    const federated = {
        google_client_id: '',
        facebook_app_id: '',
        amazon_client_id: ''
    };

    return (
        <Authenticator federated={federated}>
    )
```
#### Customize UI

In order to customize the UI for Federated Identities sign-in, you can use `withFederated` component. The following code shows how you customize the login buttons and the layout for social sign-in. 

```jsx
import { withFederated } from 'aws-amplify-react';

const Buttons = (props) => (
    <div>
        <img
            onClick={props.googleSignIn}
            src={google_icon}
        />
        <img
            onClick={props.facebookSignIn}
            src={facebook_icon}
        />
        <img
            onClick={props.amazonSignIn}
            src={amazon_icon}
        />
    </div>
)

const Federated = withFederated(Buttons);

...

const federated = {
    google_client_id: '',
    facebook_app_id: '',
    amazon_client_id: ''
};

<Federated federated={federated} onStateChange={this.handleAuthStateChange} />
```

There is also `withGoogle`, `withFacebook`, `withAmazon` components, in case you need to customize a single provider.

### User Attributes

You can pass user attributes during sign up:

```js
Auth.signUp({
    'username': 'jdoe',
    'password': 'mysecurerandompassword#123',
    'attributes': {
        'email': 'me@domain.com',
        'phone_number': '+12128601234', // E.164 number convention
        'first_name': 'Jane',
        'last_name': 'Doe',
        'nick_name': 'Jane'
    }
});
```

You can retrieve user attributes:

```js
let user = await Auth.currentAuthenticatedUser();
```

You can update user attributes:

```js
let result = await Auth.updateUserAttributes(user, {
    'email': 'me@anotherdomain.com',
    'last_name': 'Lastname'
});
console.log(result); // SUCCESS
```

If you change the email address, the user you will receive a confirmation code. In your app, you can confirm the verification code:

```js
let result = await Auth.verifyCurrentUserAttributeSubmit('email', 'abc123');
```

## Customizations

### UI Theme

AWS Amplify's default UI components are theme based. To see the default styling, check  `AmplifyTheme.js` for the related package in our repo.

You can create create your own theme, and use it to render Amplify components:

```jsx
import MyTheme from './MyTheme';

<Authenticator theme={MyTheme} />
```

Alternatively, you can import and override `AmplifyTheme` component in your code to apply style changes:

```jsx
import { AmplifyTheme } from 'aws-amplify-react';

const MySectionHeader = Object.assign({}, AmplifyTheme.sectionHeader, { background: 'orange' });
const MyTheme = Object.assign({}, AmplifyTheme, { sectionHeader: MySectionHeader });

<Authenticator theme={MyTheme} />
```

A sample them can be found [here](https://github.com/richardzcode/a-theme-react).
{: .callout .callout--info}

### Error Messages

During authentication flows, Amplify handles error messages returned from server. Amplify provides a simple way of customizing those error messages with a `messageMap` callback.

The function simply takes the original message as arguments and then outputs the desired message. Check `AmplifyMessageMap.js` file to see how Amplify makes the map function.

```jsx
const map = (message) => {
    if (/incorrect.*username.*password/i.test(message)) {
        return 'Incorrect username or password';
    }

    return message;
}

<Authenticator errorMessage={map} />
```

You may notice in `AmplifyMessageMap.js` it also handles internationalization. This topic is covered in our [I18n Guide](/media/i18n_guide/index.html).

### Working with AWS Service Objects

You can use AWS *Service Interface Objects* to work AWS Services in authenticated State. You can call methods on any AWS Service interface object by passing your credentials from `Auth` object to the service call constructor:

```js

import Route53 from 'aws-sdk/clients/route53';

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

Full API Documentation for Service Interface Objects is available [here](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/_index.html).

Note: In order to work with Service Interface Objects, your Amazon Cognito users' [IAM role](https://docs.aws.amazon.com/cognito/latest/developerguide/iam-roles.html) must have the appropriate permissions to call the requested services.
{: .callout .callout--warning}

For the complete API documentation for Authentication module, visit our [API Reference](/api/classes/authclass.html)
{: .callout .callout--info}