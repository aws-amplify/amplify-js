# Authentication

The AWS Amplify Auth module provides Authentication APIs and building blocks to developers wishing to use pre-build components or scaffold out custom UX. Depending on needs, Auth can be integrated at different levels.

* [Installation and Configuration](#installation-and-configuratoin)
  - [Manual Setup](#manual-setup)
  - [Automated Setup](#automated-setup)
* [Integration](#integration)
  - [1. Call APIs](#1-call-apis)
  - [2. withAuthenticator HOC](#2-withauthenticator-hoc)
  - [3. Authenticator Component](#3-authenticator-component)
  - [4. Compose Authenticator](#4-compose-authenticator)
  - [5. Write Your Own Auth UI](#5-write-your-own-auth-ui)
  - [6. Federated Identity](#6-federated-identity)
* [Extension](#extension)
  - [UI Theme](#ui-theme)
  - [Error Message](#error-message)

## Installation and Configuration

Please refer to this [Guide](install_n_config.md) for general setup. Here are Authentication specific setup.

### Manual Setup

```js
import Amplify from 'aws-amplify';

Amplify.configure({
    Auth: {
        identityPoolId: 'XX-XXXX-X:XXXXXXXX-XXXX-1234-abcd-1234567890ab', //REQUIRED - Amazon Cognito Identity Pool ID
        region: 'XX-XXXX-X', // REQUIRED - Amazon Cognito Region
        userPoolId: 'XX-XXXX-X_abcd1234', //OPTIONAL - Amazon Cognito User Pool ID
        userPoolWebClientId: 'XX-XXXX-X_abcd1234', //OPTIONAL - Amazon Cognito Web Client ID
    }
});
```

### Automated Setup

To create a project fully functioning with the Auth category.

<p align="center">
  <a target="_blank" href="https://console.aws.amazon.com/mobilehub/home#/starterkit/?config=https://github.com/aws/aws-amplify/blob/master/media/backend/import_mobilehub/user-signin.zip">
    <span>
        <img height="100%" src="https://s3.amazonaws.com/deploytomh/button-deploy-aws-mh.png"/>
    </span>
  </a>
</p>

## Integration

### 1. Call APIs

APIs can be used in any Javascript framework. [API Reference](api_reference.md) has full list. Below are some examples to get started.

#### Sign In
```js
import { Auth } from 'aws-amplify';

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

Auth.signUp(username, password, email, phone)
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

### 2. withAuthenticator HOC

For React app, then simplest way to add Auth flows into your app is to use `withAuthenticator`.

Just add these two lines to your `App.js`:

```js
import { withAuthenticator } from 'aws-amplify-react';

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
import { Authenticator } from 'aws-amplify-react';

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

When inside `Authenticator`, the App component will get a few properties.

* authState - current authentication state, signIn | signUp | confirmSignIn | confirmSignUp | forgotPassword | verifyContact | signedIn
* authData - additional data to the authState, when signedIn it is an user object
* onStateChange - callback function, for what's inside `Authenticator` to notify authState changes.

With that, to control when to render App component, simply add the following line to the `render()` method of the `App` component:
```js
    render() {
        if (this.props.authState !== 'signedIn') { return null; }
    ...
```

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

You may write your own Auth UI. JTo do this your component will leverage the following properties:

* authState
* authData
* onStateChange

This example creates an `AlwaysOn` Auth UI, which shows the current auth state.

```jsx
import { Authenticator, SignIn, SignUp, ConfirmSignUp, Greetings } from 'aws-amplify-react’;

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

Every app may have a slightly different UI. Use `withFederated`. There is also `withGoogle`, `withFacebook`, `withAmazon` if just need a single provider.

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
