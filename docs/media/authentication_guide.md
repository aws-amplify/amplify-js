# Authentication

AWS Amplify Auth module provides Authentication APIs and building blocks to developer. Depending on needs, Auth can be integrated in different levels.

* [Installation](#installation)
* [Configuration](#configuration)
  * [Manual Setup](#manual-setup)
  * [Automated Setup](#automated-setup)
* [Integration](#integration)
  - [1. Call APIs](#1-call-apis)
  - [2. withAuthenticator HOC](#2-withauthenticator-hoc)
  - [3. Authenticate Component](#3-authenticate-component)
  - [4. Compose Authenticator](#4-compose-authenticator)
  - [5. Write Your Own Auth UI](#5-write-your-own-auth-ui)
* [Extension](#extension)
  - [Component Styling](#component-styling)
  - [Error Message](#error-message)

## Installation

For Web development, regardless of framework, `aws-amplify` provides core Auth APIs
```
npm install aws-amplify
```

On React app, we have provided some helpful components in `aws-amplify-react`
```
npm install aws-amplify-react
```

In React Native development, we package core APIs and components into one `aws-amplify-react-native`
```
npm install aws-amplify-react-native
```

## Configuration

You are required to pass in an Amazon Cognito Identity Pool ID so that the library can retrieve base credentials for a user even in an UnAuthenticated state. You can configure it by yourself or let [AWS Mobile Hub do it for you](#automated-setup)!

Note: Ensure that user sign-in is set to optional in your app. To do so, go your project on [AWS Mobile Hub console](https://console.aws.amazon.com/mobilehub/home.html#/) and click on your project, and then click on the **User Sign-in** tile. Verify that **Optional**
button is selected in the options for Sign-In required.

### Manual Setup

At the top of your application entry point add in the following code before your first in order to configure the library.

```
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

In the above configuration you are required to pass in an Amazon Cognito Identity Pool ID so that the library can retrieve base credentials for a user even in an UnAuthenticated state. Also you need to include Amazon Cognito User Pool ID and Web Client ID.

[Amazon Cognito Identity](http://docs.aws.amazon.com/cognito/latest/developerguide/getting-started-with-identity-pools.html)

[Amazon Cognito User Pools](http://docs.aws.amazon.com/cognito/latest/developerguide/getting-started-with-cognito-user-pools.html)

### Automated Setup

AWS Mobile Hub streamlines the steps above for you. Simply click the button:

<p align="center">
  <a target="_blank" href="https://console.aws.amazon.com/mobilehub/home?#/?config=https://github.com/aws/aws-amplify/blob/master/media/backend/import_mobilehub/user-signin.zip">
    <span>
        <img height="100%" src="https://s3.amazonaws.com/deploytomh/button-deploy-aws-mh.png"/>
    </span>
  </a>
</p>

This will create a project that works with Auth category fully functioning. After the project is created in the Mobile Hub console download aws-exports.js by clicking the **Hosting and Streaming** tile then **Download aws-exports.js**.

![Mobile Hub](mobile_hub_1.png)

Download aws-exports.js

Then copy the file to a visible folder of your project
![Download](mobile_hub_2.png)

Now you can simply import the file and pass it as the configuration to the Amplify library:

```
import Amplify from 'aws-amplify';
import awsmobile from './YOUR_PATH_TO_EXPORTS/aws-exports'

Amplify.configure(awsmobile});
```

## Integration

### 1. Call APIs

APIs can be used in any Javascript framework. [API Reference](api_reference.md) has full list. Here are some examples

#### Sign In
```
import { Auth } from 'aws-amplify';

Auth.signIn(username, password)
    .then(data => console.log(data))
    .catch(err => console.log(err));
```

#### Sign Up
```
import { Auth } from 'aws-amplify';

Auth.signUp(username, password, email, phone)
    .then(data => console.log(data))
    .catch(err => console.log(err));
```

#### Sign Out
```
import { Auth } from 'aws-amplify';

Auth.signOut()
    .then(data => console.log(data))
    .catch(err => console.log(err));
```

### 2. withAuthenticator HOC

For React apps, the simplest way to add Auth flows into your app is to use `withAuthenticator`.

Just add these two lines to your `App.js`

```
import { withAuthenticator } from 'aws-amplify-react';

...

export default withAuthenticator(App);
```

Now your app is guarded by complete Auth flow. Only signed in user can access the app.

#### Sign Out Button

The default `withAuthenticator` renders just your App component after user is signed in. So it does not interfere with your App. Then question comes, how does the user sign out?

You just set second parameter to true, which means `includeGreetings = true`. It would put a greeting row on top of your app.
```
export default withAuthenticator(App, true);
```

### 3. Authenticate Component

The `withAuthenticator` HOC essentially just wraps `Authenticator` component inside. Use the `Authenticator` directly to give yourself more customization options.

#### Put App inside Authenticator

App.js
```
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

#### Only show App when signed in

In the above example you'll see the App rendered even before the user is signed in. This is easy to change.

When inside `Authenticator`, App component will get a few properties.

* authState - current authentication state, signIn | signUp | confirmSignIn | confirmSignUp | forgotPassword | verifyContact | signedIn
* authData - additional data to the authState, when signedIn it is an user object
* onStateChange - callback function, for what's inside `Authenticator` to notify authState changes.

With that, to control when to render App component, simply add the following line to render() method of the `App` component:
```
    render() {
        if (this.props.authState !== 'signedIn') { return null; }
    ...
```

### 4. Compose Authenticator

`Authenticator` is designed as a container, which contains a number of Auth Pieces. Each Auth Piece does one job, for example SignIn, SignUp etc.

You can compose your own Authenticator, don't forget to set `hideDefault` to true.

For example, this Authenticator only shows Greetings component, which has Sign Out button
```
    <Authenticator hideDefault={true}>
        <Greetings />
    </Authenticator>
```

#### Greetings message

Greetings component has messages for two different auth state: signedIn, and signedOut. To customize the messages, set properties `signedInMessage` and `signedOutMessage`, string or function.

```
    <Authenticator hideDefault={true}>
        <Greetings
            signedInMessage={(username) => 'Hello ' + username}
            signedOutMessage="Come back"
        />
    </Authenticator>
```

### 5. Write Your Own Auth UI

You may write your own Auth Piece. Just make your component to be aware of these properties:
* authState
* authData
* onStateChange

This example creates an `AlwaysOn` Auth Piece, which shows current auth state.
```
import { Authenticator, SignIn, SignOut, ConfirmSignUp, Greetings } from 'aws-amplify-react’;

const AlwaysOn = (props) => {
    return (
        <div>
            <div>I am always here to show current auth state: {this.props.authState}</div>
            <button onClick={() => this.props.onStateChange('signUp')}>Show Sign Up</button>
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

## Extension

### Component Styling

Amplify UI components are theme based. check `AmplifyTheme.js` file for default styling.

You may want to create your own theme, and then pass to Amplify components.
```
import MyTheme from './MyTheme';

<Authenticator theme={MyTheme} />
```

Or maybe override `AmplifyTheme`
```
import { AmplifyTheme } from 'aws-amplify-react';

const MySectionHeader = Object.assign({}, AmplifyTheme.sectionHeader, { background: 'orange' });
const MyTheme = Object.assign({}, AmplifyTheme, { sectionHeader: MySectionHeader });

<Authenticator theme={MyTheme} />
```

### Error Message

During authentication flows, there are some error messages returned from server. Amplify provides a simple way of customizing error messages. A callback `messageMap` function.

The function simply takes the original message then output desired message. Check `AmplifyMessageMap.js` to see how Amplify makes its map function.

```
const map = (message) => {
    if (/incorrect.*username.*password/i.test(message)) {
        return 'Incorrect username or password';
    }

    return message;
}

<Authenticator errorMessage={map} />
```

You may notice in `AmplifyMessageMap.js` it also does internationalization. The topic is covered in [I18n Guide](i18n_guide.md)
