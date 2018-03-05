# Authentication

The AWS Amplify Auth module provides Authentication APIs and building blocks to developers wishing to use pre-build components or scaffold out custom UX. Depending on needs, Auth can be integrated at different levels.

* [Installation and Configuration](#installation-and-configuratoin)
  - [Automated Setup](#automated-setup)
  - [Manual Setup](#manual-setup)
* [Integration](#integration)
  - [1. Call APIs](#1-call-apis)
  - [2. withAuthenticator HOC](#2-withauthenticator-hoc)
  - [3. Authenticator Component](#3-authenticator-component)
  - [4. Compose Authenticator](#4-compose-authenticator)
  - [5. Write Your Own Auth UI](#5-write-your-own-auth-ui)
  - [6. Federated Identity](#6-federated-identity)
  - [7. User Attributes](#7-user-attributes)
  - [8. Select Preferred MFA](#8-select-preferred-mfa)
* [Extension](#extension)
  - [UI Theme](#ui-theme)
  - [Error Message](#error-message)
  - [AWS Services](#aws-services)

## Installation and Configuration

Please refer to this [Guide](install_n_config.md) for general setup. Here are Authentication specific setup.

### Automated Setup

To create a project fully functioning with the Auth category.

```
$ npm install -g awsmobile-cli
$ cd my-app
$ awsmobile init
$ awsmobile enable user-signin
$ awsmobile push
```

In your project i.e. App.js:

```js
import Amplify, { Auth } from 'aws-amplify';
import aws_exports from './aws-exports';
Amplify.configure(aws_exports);
```

### Manual Setup

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

### 1. Call APIs

APIs can be used in any Javascript framework. [API Reference](api_reference.md) has full list. Below are some examples to get started.

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

#### Current Session
Return a `CognitoUserSession` which contains JWT `accessToken`, `idToken`, and `refreshToken`.
```js
let session = Auth.currentSession();
// CognitoUserSession => { idToken, refreshToken, accessToken }
```

#### Setup TOTP
```js
import { Auth } from 'aws-amplify';

// To setup TOTP, first you need to get a secret code from AWS Cognito
// user -> the current Authenticated user
Auth.setupTOTP(user).then((code) => {
    // directly output the code or transfer it into a QR code
});

// ...

// Then you will have your TOTP account in your App (like Google Authenticator)
// Use the password generated to verify the setup
Auth.verifyTotpToken(user).then(() => {
    // don't forget to set TOTP as the preferred MFA method
    Auth.setPreferredMFA(user, 'TOTP');
    // ...
});
```

#### Select MFA Type
```js
import { Auth } from 'aws-amplify';

// You can select preferred mfa type, for example:
// Select TOTP as preferred
Auth.setPreferredMFA(user, 'TOTP').then((data) => {
    console.log(data);
    // ...
}).catch(e => {});

// Select SMS as preferred
Auth.setPreferredMFA(user, 'SMS');

// Select no-mfa
Auth.setPreferredMFA(user, 'NOMFA');

// Please Note that this will only work
```

### 2. withAuthenticator HOC

<img src="https://dha4w82d62smt.cloudfront.net/items/2R3r0P453o2s2c2f3W2O/Screen%20Recording%202018-02-11%20at%2003.48%20PM.gif" style="display: block;height: auto;width: 100%;"/>

For React and React Native apps, the simplest way to add Auth flows into your app is to use `withAuthenticator`.

Just add these two lines to your `App.js`:

```js
import { withAuthenticator } from 'aws-amplify-react'; // or 'aws-amplify-react-native';

...

export default withAuthenticator(App);
```

Now your app is guarded by complete Auth flow. Only signed in user can access the app.

#### Federated Identity

You can enable federated Identity login by specifying federated option.

```js
const AppWithAuth = withAuthenticator(App);

const federated = {
    google_client_id: '',
    facebook_app_id: '',
    amazon_client_id: ''
};

ReactDOM.render(<AppWithAuth federated={federated}/>, document.getElementById('root'));
```

 NOTE: Federated Identity HOCs are not yet available on React Native

#### Sign Out Button

The default `withAuthenticator` renders just the App component after a user is signed in, preventing interference with your app. Then question comes, how does the user sign out?

To expose this, set the second parameter to true, which means `includeGreetings = true`. It will put a greeting row on top of your app.

```js
export default withAuthenticator(App, { includeGreetings: true });
```

### 3. Authenticator Component

The `withAuthenticator` HOC essentially just wraps `Authenticator` component. You can use the `Authenticator` directly to give yourself more customization options.

#### Example: Put App inside Authenticator

App.js
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

#### Example: Only show App when signed in

In the above example you'll see the App rendered even before the user is signed in. This is easy to change.

When inside `Authenticator`, the App component will receive a few properties.

**authState** is the current authentication state (a string):
 - `signIn`
 - `signUp`
 - `confirmSignIn`
 - `confirmSignUp`
 - `forgotPassword`
 - `verifyContact`
 - `signedIn`

**authData** - additional data within authState, when `signedIn`, it is a `user` object

With that, to control when to render App component, simply add

```js
    this._validAuthStates = ['signedIn'];
```
to the component's constructor, then implement `showComponent(theme) {}` in lieu of the typical
`render() {}` method.

### 4. Compose Authenticator

`Authenticator` is designed as a container, which contains a number of Auth components. Each component does one job, for example SignIn, SignUp etc.

You can compose your own Authenticator, but you must set `hideDefault={true}`.

For example, this Authenticator only shows Greetings component which has a Sign Out button:

```jsx
    <Authenticator hideDefault={true}>
        <Greetings />
    </Authenticator>
```

#### Greeting message

The Greetings component has messages for two different auth states: signedIn, and signedOut. To customize the messages, set properties `inGreeting` and `outGreeting` using a string or function.

```jsx
    <Authenticator hideDefault={true}>
        <Greetings
            inGreeting={(username) => 'Hello ' + username}
            outGreeting="Come back"
        />
    </Authenticator>
```

### 5. Write Your Own Auth UI

You may write your own Auth UI. To do this your component will leverage the following properties:

* authState
* authData
* onStateChange

This example creates an `AlwaysOn` Auth UI, which shows the current auth state.

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
    if (state === 'signedIn') { /* GO TO Main Page */ }
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

### 6. Federated Identity

Note: Our federated identity components so far only support Google, Facebook and Amazon, only available for React. Building is in progress.

Setup guide is [here](federated_identity_setup.md).

After setup. Just add `Google client_id`, `Facebook app_id` and/or `Amazon client_id` to `Authenticator`
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
#### Custom federated identity UI

Every app may have a slightly different UI. Use `withFederated`. There is also `withGoogle`, `withFacebook`, `withAmazon` if you just need a single provider.

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

### 7 User Attributes

You can pass in any user attributes during sign up:

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

You can then update the user attributes:

```js
let result = await Auth.updateUserAttributes(user, {
    'email': 'me@anotherdomain.com',
    'last_name': 'Lastname'
});
console.log(result); // SUCCESS
```

If you change the email address you will receive a confirmation code to that email and you can confirm it with the code:

```js
let result = await Auth.verifyCurrentUserAttributeSubmit('email', 'abc123');
```

### 8 Select Preferred MFA

You can directly use the ```SelectMFType``` UI Component provided by ```aws-amplify-react```.

```js
import { SelectMFAType } from 'aws-amplify-react';

// Please have at least TWO types
// Please make sure you set it properly accroding to your Cognito Userpool
const MFATypes = {
    SMS: true, // if SMS enabled in your user pool
    TOTP: true, // if TOTP enabled in your user pool
    Optional: true, // if MFA is set to optional in your user pool
}

render() {
    return (
        // ...
        <SelectMFAType authData={this.props.authData} MFATypes={MFATypes}>
    )
}
```

## Extensions

### UI Theme

Amplify UI components are theme based. Check the `AmplifyTheme.js` file for default styling.

You may want to create your own theme, and then pass to Amplify components.

```jsx
import MyTheme from './MyTheme';

<Authenticator theme={MyTheme} />
```

Alternatively, override `AmplifyTheme`:

```jsx
import { AmplifyTheme } from 'aws-amplify-react';

const MySectionHeader = Object.assign({}, AmplifyTheme.sectionHeader, { background: 'orange' });
const MyTheme = Object.assign({}, AmplifyTheme, { sectionHeader: MySectionHeader });

<Authenticator theme={MyTheme} />
```

Theme example can be found [here](https://github.com/richardzcode/a-theme-react)

### Error Message

During authentication flows, there are some error messages returned from server. Amplify provides a simple way of customizing error messages with a `messageMap` callback.

The function simply takes the original message as arguments and then outputs the desired message. Check `AmplifyMessageMap.js` to see how Amplify makes the map function.

```jsx
const map = (message) => {
    if (/incorrect.*username.*password/i.test(message)) {
        return 'Incorrect username or password';
    }

    return message;
}

<Authenticator errorMessage={map} />
```

You may notice in `AmplifyMessageMap.js` it also handles internationalization. The topic is covered in [I18n Guide](i18n_guide.md)

### AWS Services

You can call methods on any AWS Service by passing in your credentials from auth to the service call constructor:

```js
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

Note: your Amazon Cognito users' [IAM role](https://docs.aws.amazon.com/cognito/latest/developerguide/iam-roles.html) must have the appropriate permissions to call the requested services.

Full API Documentation is available <a href="https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/_index.html" target="_blank">here</a>.
