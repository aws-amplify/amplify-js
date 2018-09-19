---
---

# Authentication

AWS Amplify Authentication module provides Authentication APIs and building blocks for developers who want to create user authentication experiences.

**Amazon Cognito**

[Amazon Cognito User Pools](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-identity-pools.html) is a full-featured user directory service to handle user registration, storage, authentication, and account recovery. Cognito User Pools returns JWT tokens to your app and does not provide temporary AWS credentials for calling authorized AWS Services.
[Amazon Cognito Federated Identities](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-identity.html) on the other hand, is a way to authorize your users to use the various AWS services. With an identity pool, you can obtain temporary AWS credentials with permissions you define to access other AWS services directly or to access resources through Amazon API Gateway.

When working together, Cognito User Pools acts as a source of user identities (identity provider) for the Cognito Federated Identities. Other sources can be OpenID, Facebook, Google, etc. AWS Amplify uses User Pools to store your user information and handle authorization, and it leverages Federated Identities to manage user access to AWS Resources, for example allowing a user to upload a file to an S3 bucket.

Ensure you have [installed and configured the Amplify CLI and library]({%if jekyll.environment == 'production'%}{{site.amplify.docs_baseurl}}{%endif%}/media/quick_start).
{: .callout .callout--info}

### Automated Setup

Run the following command in your project's root folder:

```bash
$ amplify add auth
```

If you have previously enabled an Amplify category that uses Auth behind the scenes, e.g. API category, you may already have an Auth configuration. In such a case, run `amplify auth update` command to edit your configuration.
{: .callout .callout--info}

The CLI prompts will help you to customize your auth flow for your app. With the provided options, you can:
- Customize sign-in/registration flow 
- Customize email and SMS messages for Multi-Factor Authentication
- Customize attributes for your users, e.g. name, email
- Enable 3rd party authentication providers, e.g. Facebook, Twitter, Google and Amazon

After configuring your Authentication options, update your backend:

```bash
$ amplify push
```

A configuration file called `aws-exports.js` will be copied to your configured source directory, for example `./src`.

##### Configure Your App

In your app's entry point i.e. App.js, import and load the configuration file:

```js
import Amplify, { Auth } from 'aws-amplify';
import aws_exports from './aws-exports';
Amplify.configure(aws_exports);
```

### Manual Setup

For manual configuration you need to provide your AWS Resource configuration:

```js
import Amplify from 'aws-amplify';

Amplify.configure({
    Auth: {

        // REQUIRED only for Federated Authentication - Amazon Cognito Identity Pool ID
        identityPoolId: 'XX-XXXX-X:XXXXXXXX-XXXX-1234-abcd-1234567890ab',
        
        // REQUIRED - Amazon Cognito Region
        region: 'XX-XXXX-X',

        // OPTIONAL - Amazon Cognito Federated Identity Pool Region 
        // Required only if it's different from Amazon Cognito Region
        identityPoolRegion: 'XX-XXXX-X',

        // OPTIONAL - Amazon Cognito User Pool ID
        userPoolId: 'XX-XXXX-X_abcd1234',

        // OPTIONAL - Amazon Cognito Web Client ID (26-char alphanumeric string)
        userPoolWebClientId: 'a1b2c3d4e5f6g7h8i9j0k1l2m3',

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
        },

        // OPTIONAL - customized storage object
        storage: new MyStorage(),
        
        // OPTIONAL - Manually set the authentication flow type. Default is 'USER_SRP_AUTH'
        authenticationFlowType: 'USER_PASSWORD_AUTH'
    }
});
```

## Working with the API

### Common Authentication Use Cases

The Authentication category exposes a set of APIs to be used in any JavaScript framework. Please check [AWS Amplify API Reference]({%if jekyll.environment == 'production'%}{{site.amplify.docs_baseurl}}{%endif%}/api/classes/authclass.html) for full API list.

#### Sign In

Sign in with user credentials:

```js
import { Auth } from 'aws-amplify';

Auth.signIn(username, password)
    .then(user => console.log(user))
    .catch(err => console.log(err));

// If MFA is enabled, sign-in should be confirmed with the congirmation code
// `user` : Return object from Auth.signIn()
// `code` : Confirmation code  
// `mfaType` : MFA Type e.g. SMS, TOTP.
Auth.confirmSignIn(user, code, mfaType)
    .then(data => console.log(data))
    .catch(err => console.log(err));
```

#### Sign Up

Creates a new user in your User Pool:

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

// After retrieveing the confirmation code from the user
Auth.confirmSignUp(username, code, {
    // Optional. Force user confirmation irrespective of existing alias. By default set to True.
    forceAliasCreation: true    
}).then(data => console.log(data))
  .catch(err => console.log(err));
```

**Forcing Email Uniqueness in Cognito User Pools**

When your Cognito User Pool sign-in options are set to "*Username*", and "*Also allow sign in with verified email address*", *signUp()* method creates a new user account everytime, without validating email uniqueness. In this case you will end up having multiple user pool identities and previously created account's attribute is changed to *email_verified : false*. 

To enforce Cognito User Pool signups with a unique email, you need to change your User Pool's *Attributes* setting in [Amazon Cognito console](https://console.aws.amazon.com/cognito) as the following:

![User Pool Settings]({%if jekyll.environment == 'production'%}{{site.amplify.docs_baseurl}}{%endif%}/media/images/cognito_user_pool_settings.png){: style="max-height:300px;"}

#### Sign Out
```js
import { Auth } from 'aws-amplify';

Auth.signOut()
    .then(data => console.log(data))
    .catch(err => console.log(err));

// By doing this, you are revoking all the auth tokens(id token, access token and refresh token)
// which means the user is signed out from all the devices
// Note: although the tokens are revoked, the AWS credentials will remain valid until they expire (which by default is 1 hour)
Auth.signOut({ global: true })
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

#### Verify phone_number or email address
Either the phone number or the email address is required for account recovery. You can let the user verify those attributes by:
```js
// To initiate the process of verifying the attribute like 'phone_number' or 'email'
Auth.verifyCurrentUserAttributes(attr)
.then(() => {
     console.log('a verification code is sent');
}).catch(e) => {
     console.log('failed with error', e);
});

// To verify attribute with the code
Auth.verifyCurrentUserAttributeSubmit(attr, 'the_verification_code')
.then(() => {
     console.log('phone_number verified');
}).catch(e) => {
     console.log('failed with error', e);
});
```

#### Retrieve Current Authenticated User

You can call `Auth.currentAuthenticatedUser()` to get the current authenticated user object.
```js
import { Auth } from 'aws-amplify';

Auth.currentAuthenticatedUser()
    .then(user => console.log(user))
    .catch(err => console.log(err));
```
This method can be used to check if a user is logged in when the page is loaded. It will throw an error if there is no user logged in.
This method should be called after the Auth module is configured or the user is logged in. To ensure that you can listen on the auth events `configured` or `signIn`. [Learn how to listen on auth events.]({%if jekyll.environment == 'production'%}{{site.amplify.docs_baseurl}}{%endif%}/media/hub_guide#listening-authentication-events)

#### Retrieve Current Session

`Auth.currentSession()` returns a `CognitoUserSession` object which contains JWT `accessToken`, `idToken`, and `refreshToken`.

```js
let session = Auth.currentSession();
// CognitoUserSession => { idToken, refreshToken, accessToken }
```

#### Managing Security Tokens

**When using Authentication with AWS Amplify, you don't need to refresh Amazon Cognito tokens manually. The tokens are automatically refreshed by the library when necessary.**

Security Tokens like *IdToken* or *AccessToken* are stored in *localStorage* for the browser and in *AsyncStorage* for React Native. If you want to store those tokens in a more secure place or you are using Amplify in server side, then you can provide your own `storage` object to store those tokens. 

For example:
```ts
class MyStorage {
    // set item with the key
    static setItem(key: string, value: string): string;
    // get item with the key
    static getItem(key: string): string;
    // remove item with the key
    static removeItem(key: string): void;
    // clear out the storage
    static clear(): void;
    // If the storage operations are async(i.e AsyncStorage)
    // Then you need to sync those items into the memory in this method
    static sync(): Promise<void>;
}

// tell Auth to use your storage object
Auth.configure({
    storage: MyStorage
});
```

To learn more about tokens, please visit [Amazon Cognito Developer Documentation](https://docs.aws.amazon.com/cognito/latest/developerguide/amazon-cognito-user-pools-using-tokens-with-identity-providers.html).

### Using Components in React

For React and React Native apps, the simplest way to add authentication flows into your app is to use *withAuthenticator* High Order Component.

*withAuthenticator* automatically detects the authentication state and updates the UI. If the user is signed in, the underlying component (typically your app's main component) is displayed otherwise signing/signup controls is displayed.

Just add these two lines to your `App.js`:

```js
import { withAuthenticator } from 'aws-amplify-react'; // or 'aws-amplify-react-native';
...
export default withAuthenticator(App);
```
Now, your app has complete flows for user sign-in and registration. Since you have wrapped your **App** with `withAuthenticator`, only signed in users can access your app. The routing for login pages and giving access to your **App** Component will be managed automatically.

#### Enabling Federated Identities

You can enable federated Identity login by specifying  *federated* option. Here is a configuration for enabling social login with multiple providers:

```js
const AppWithAuth = withAuthenticator(App);

const federated = {
    google_client_id: '',
    facebook_app_id: '',
    amazon_client_id: ''
};

ReactDOM.render(<AppWithAuth federated={federated}/>, document.getElementById('root'));
```

You can also initiate a federated signin process by calling `Auth.federatedSignIn()` method with a specific identity provider in your code:  

```js
import { Auth } from 'aws-amplify';

// Retrieve active Google user session
const ga = window.gapi.auth2.getAuthInstance();
ga.signIn().then(googleUser => {
    const { id_token, expires_at } = googleUser.getAuthResponse();
    const profile = googleUser.getBasicProfile();
    const user = {
        email: profile.getEmail(),
        name: profile.getName()
    };

    return Auth.federatedSignIn(
        // Initiate federated sign-in with Google identity provider 
        'google',
        { 
            // the JWT token
            token: id_token, 
            // the expiration time
            expires_at 
        },
        // a user object
        user
    ).then(() => {
        // ...
    });
});
```

Availible identity providers are `google`, `facebook`, `amazon`, `developer` and OpenID. To use an `OpenID` provider, use the URI of your provider as the key, e.g. `accounts.your-openid-provider.com`.

**Retrieving JWT Token**

After the federated login, you can retrieve related JWT token from the local cache using the *Cache* module: 
```js
import { Cache } from 'aws-amplify';

// Run this after the sign-in
Cache.getItem('federatedInfo').then(federatedInfo => {
     const { token } = federatedInfo;
});
```

**Refreshing JWT Tokens**

By default, AWS Amplify will automatically refresh the tokens for Google and Facebook, so that your AWS credentials will be valid at all times. But if you are using another federated provider, you will need to provide your own token refresh method:
```js
import { Auth } from 'aws-amplify';

function refreshToken() {
    // refresh the token here and get the new token info
    // ......

    return new Promise(res, rej => {
        const data = {
            token, // the token from the provider
            expires_at, // the timestamp for the expiration
            identity_id, // optional, the identityId for the credentials
        }
        res(data);
    });
}

Auth.configure({
    refreshHandlers: {
        'developer': refreshToken
    }
})
```

#### Rendering a Sign Out Button

`withAuthenticator` component renders your App component after a successful user signed in, and it prevents non-sign-in uses to interact with your app. In this case, we need to display a *sign-out* button to trigger the related process.

To display a sign-out button, set `includeGreetings = true` in the parameter object. It displays a *greetings section* on top of your app, and a sign-out button is displayed in the authenticated state.

```js
export default withAuthenticator(App, { includeGreetings: true });
```

### Using Authenticator Component

The `withAuthenticator` HOC essentially just wraps `Authenticator` component. Using `Authenticator` directly gives you more customization options for your UI.

#### Wrapping your Component

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

#### Show your App After Sign-in

In the previous example, you'll see the App is rendered even before the user is signed-in. To change this behavior, you can use *Authenticator* properties. When inside `Authenticator`, the App component automatically receives those properties.

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

Using the options above, to control the condition for *Authenticator* to render App component, simply set `_validAuthStates` property:

```js
this._validAuthStates = ['signedIn'];
```

Then, in the component's constructor,  implement `showComponent(theme) {}` in lieu of the typical `render() {}` method.

### Federated Identities (Social Sign-in)

**Availability Note**
Currently, our federated identity components only support Google, Facebook and Amazon identities. Please see our[ Setup Guide for Federated Identities]({%if jekyll.environment == 'production'%}{{site.amplify.docs_baseurl}}{%endif%}/media/federated_identity_setup).
{: .callout .callout--info}

To enable social sign-in in your app with Federated Identities, add `Google client_id`, `Facebook app_id` and/or `Amazon client_id` properties to *Authenticator* component:

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

For *React Native*, you can use `Auth.federatedSignIn()` to get your federated identity from Cognito. You need to provide a valid JWT token from the third provider. You can also use it with `Authenticator`, so that component automatically persists your login status.

Federated Sign in with Facebook Example:
```js
import Expo from 'expo';
import Amplify, { Auth } from 'aws-amplify';
import { Authenticator } from 'aws-amplify-react-native';

export default class App extends React.Component {
  async signIn() {
    const { type, token, expires } = await Expo.Facebook.logInWithReadPermissionsAsync('YOUR_FACEBOOK_APP_ID', {
        permissions: ['public_profile'],
      });
    if (type === 'success') {
      // sign in with federated identity
      Auth.federatedSignIn('facebook', { token, expires_at: expires}, { name: 'USER_NAME' })
        .then(credentials => {
          console.log('get aws credentials', credentials);
        }).catch(e => {
          console.log(e);
        });
    }
  }

  // ...

  render() {
    return (
      <View style={styles.container}>
        <Authenticator>
        </Authenticator>
        <Button title="FBSignIn" onPress={this.signIn.bind(this)} />
      </View>
    );
  }
}
```

#### Customize UI

To customize the UI for Federated Identities sign-in, you can use `withFederated` component. The following code shows how you customize the login buttons and the layout for social sign-in.

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

### Using Amazon Cognito Hosted UI

Amazon Cognito provides a customizable user experience via the hosted UI. The hosted UI supports OAuth 2.0 and Federated Identities with Facebook, Amazon, Google, and SAML providers. To learn more about Amazon Cognito Hosted UI, please visit [Amazon Cognito Developer Guide](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-pools-configuring-app-integration.html).

#### Setup your Cognito App Client

To start using hosted UI, you need to setup your App Client in the Amazon Cognito console.

To setup App Client;
- Go to [Amazon Cognito Console](https://aws.amazon.com/cognito/).
- Click *User Pools* on the top menu to select a User Pool or create a new one.
- Click *App integration*  and *App client settings* on the left menu.
- Select *Enabled Identity Providers* and enter *Callback URL(s)* and *Sign out URL(s)* fields.
- Under the *OAuth 2.0* section, select an OAuth Flow. *Authorization code grant* is the recommended choice for security reasons.
- Choose item(s) from *OAuth Scopes*.
- Click 'Save Changes'

To enable the domain for your hosted UI;

- On the left menu, go to  *App integration* > *Domain name*.
- In the *Domain prefix* section, enter the prefix for the pages that will be hosted by Amazon Cognito.

You can also enable Federated Identities for your hosted UI;  

- Go to *Federation* > *Identity providers*
- Select an *Identity provider* and enter required credentials for the identity provider. (e.g., App Id, App secret, Authorized scope)
- In the settings page for your selected identity provider (Facebook, Google, etc.),  set *Oauth Redirected URI* to `https://your-domain-prefix.auth.us-east-1.amazoncognito.com/oauth2/idpresponse` (*your-domain-prefix* is the domain prefix you have entered in previously).
- To retrieve user attributes from your identity provider, go to *Federation* > *Attribute mapping*. Here, you can map Federation Provider attributes to corresponding User pool attributes. 

If  *email* attribute is a required field in your Cognito User Pool settings, please make sure that you have selected *email* in your Authorized Scopes, and you have mapped it correctly to your User Pool attributes.
{: .callout .callout-info}

#### Configuring the Hosted UI

To configure your application for hosted UI, you need to use *oauth* options:

```js
import Amplify from 'aws-amplify';

const oauth = {
    // Domain name
    domain : 'your-domain-prefix.auth.us-east-1.amazoncognito.com', 
    
    // Authorized scopes
    scope : ['phone', 'email', 'profile', 'openid','aws.cognito.signin.user.admin'], 

    // Callback URL
    redirectSignIn : 'http://www.example.com/signin', 
    
    // Sign out URL
    redirectSignOut : 'http://www.example.com/signout',

    // 'code' for Authorization code grant, 
    // 'token' for Implicit grant
    responseType: 'code'

    // optional, for Cognito hosted ui specified options
    options: {
        // Indicates if the data collection is enabled to support Cognito advanced security features. By default, this flag is set to true.
        AdvancedSecurityDataCollectionFlag : true
    }
}

Amplify.configure({
    Auth: {
        // other configurations...
        // ....
        oauth: oauth
    },
    // ...
});
```

#### Launching the Hosted UI

To invoke the browser to display the hosted UI, you need to construct the URL in your app;

```js
const config = Auth.configure();
const { 
    domain,  
    redirectSignIn, 
    redirectSignOut,
    responseType } = config.oauth;

const clientId = config.userPoolWebClientId;
// The url of the Cognito Hosted UI
const url = 'https://' + domain + '/login?redirect_uri=' + redirectSignIn + '&response_type=' + responseType + '&client_id=' + clientId;
// If you only want to log your users in with Google or Facebook, you can construct the url like:
const url_to_google = 'https://' + domain + '/oauth2/authorize?redirect_uri=' + redirectSignIn + '&response_type=' + responseType + '&client_id=' + clientId + '&identity_provider=Google';
const url_to_facebook = 'https://' + domain + '/oauth2/authorize?redirect_uri=' + redirectSignIn + '&response_type=' + responseType + '&client_id=' + clientId + '&identity_provider=Facebook';

// Launch hosted UI
window.location.assign(url);

// Launch Google/Facebook login page
window.location.assign(url_to_google);
window.location.assign(url_to_facebook);
```



#### Launching the Hosted UI in React 

With React, you can use `withOAuth` HOC to launch the hosted UI experience. Just wrap your app's main component with our HOC:

```js
import { withOAuth } from 'aws-amplify-react';

class MyApp extends React.Component {
    // ...
    render() {
        return(
            <button onClick={this.props.OAuthSignIn}>
                Sign in with AWS
            </button>
        )
    }
}

export default withOAuth(MyApp);
``` 

#### Handling Authentication Events

When using the hosted UI, you can handle authentication events by creating event listeners with the [Hub module]({%if jekyll.environment == 'production'%}{{site.amplify.docs_baseurl}}{%endif%}/media/hub_guide#listening-authentication-events).
    
### Enabling MFA

MFA (Multi-factor authentication increases security for your app by adding an authentication method and not relying solely on the username (or alias) and password. AWS Amplify uses Amazon Cognito to provide MFA. Please see [Amazon Cognito Developer Guide](https://docs.aws.amazon.com/cognito/latest/developerguide/user-pool-settings-mfa.html) for more information about setting up MFA in Amazon Cognito.

Once you enable MFA on Amazon Cognito, you can configure your app to work with MFA.

#### Enabling TOTP

With TOTP (Time-based One-time Password), your app user is challenged to complete authentication using a time-based one-time (TOTP) password after their username and password have been verified.

You can setup TOTP for a user in your app:

```js
import { Auth } from 'aws-amplify';

// To setup TOTP, first you need to get a `authorization code` from Amazon Cognito
// `user` is the current Authenticated user
Auth.setupTOTP(user).then((code) => {
    // You can directly display the `code` to the user or convert it to a QR code to be scanned.
    // E.g., use following code sample to render a QR code with `qrcode.react` component:  
    //      import QRCode from 'qrcode.react';
    //      const str = "otpauth://totp/AWSCognito:"+ username + "?secret=" + code + "&issuer=" + issuer;
    //      <QRCode value={str}/>
});

// ...

// Then you will have your TOTP account in your TOTP-generating app (like Google Authenticator)
// Use the generated one-time password to verify the setup
Auth.verifyTotpToken(user, challengeAnswer).then(() => {

    // don't forget to set TOTP as the preferred MFA method
    Auth.setPreferredMFA(user, 'TOTP');
    // ...
}).catch( e => {
    // Token is not verified
});
```

#### Setup MFA Type

There are multiple MFA types supported by Amazon Cognito. You can set the preferred method in your code:

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
```

#### Retrieving Current Preferred MFA Type

You can get current preferred MFA type in your code:
```js
import { Auth } from 'aws-amplify';

Auth.getPreferredMFA(user).then((data) => {
    console.log('Current prefered MFA type is: ' + data);
})
```

#### Letting User Select MFA Type

When working with multiple MFA Types, you can let the app user select the desired authentication method. `SelectMFAType` UI Component, which is provided with `aws-amplify-react` package, renders a list of available MFA types.

```js
import Amplify from 'aws-amplify';
import amplify from './aws-exports';
import { SelectMFAType } from 'aws-amplify-react';

Amplify.configure(amplify);

// Please have at least TWO types
// Please make sure you set it properly according to your Cognito User pool
const MFATypes = {
    SMS: true, // if SMS enabled in your user pool
    TOTP: true, // if TOTP enabled in your user pool
    Optional: true, // if MFA is set to optional in your user pool
}

class App extends Component {
    // ...
    render() {
        return (
            // ...
            <SelectMFAType authData={this.props.authData} MFATypes={MFATypes}>
        )
    }
}

export default withAuthenticator(App, true);
```

### Customizing Authentication Flow

Amazon Cognito User Pools support customizing the authentication flow to enable new challenge types, in addition to a password, to verify the identity of users. These challenge types may include CAPTCHAs or dynamic challenge questions.

To define your challenges for custom authentication flow, you need to implement Lambda triggers for Amazon Cognito.

### Switching Authentication Flow Type

There are two different types of authentication flow supported: `USER_SRP_AUTH` and `USER_PASSWORD_AUTH`. `USER_SRP_AUTH` is used by default and utilizes the SRP protocol (Secure Remote Password) to encrypt the password on the client before it's sent to the back-end. It is a more secure way of sending user credentials over the network and is, therefore, the recommended approach.

The `USER_PASSWORD_AUTH` flow will send user credentials unencrypted to the back-end. If you want to migrate users to Cognito using the "Migration" trigger and avoid forcing users to reset their passwords, you need to use this authentication flow type as the Lambda function invoked by the trigger has to be able to verify the supplied user credentials.

To configure `Auth` to use the `USER_PASSWORD_AUTH` flow, add it as a string value to the property `authenticationFlowType`:

```js
Auth.configure({
    // other configurations...
    // ...
    authenticationFlowType: 'USER_PASSWORD_AUTH',
})
```

For your Cognito User Pool to accept authentication requests using `USER_PASSWORD_AUTH`, your Cognito app client has to be configured to allow that flow. In the AWS Console, this is done by ticking the checkbox at General settings > App clients > Show Details (for the affected client) > Enable username-password (non-SRP) flow. If you're using the AWS CLI or Cloudformation, update your app client by adding `USER_PASSWORD_AUTH` to the list of "Explicit Auth Flows".

#### Creating a CAPTCHA

The following Lambda creates a CAPTCHA as a challenge to the user. The URL for the CAPTCHA image and  the expected answer is added to the private challenge parameters:

```js
export const handler = async (event) => {
    if (!event.request.session || event.request.session.length === 0) {
        event.response.publicChallengeParameters = {
            captchaUrl: "url/123.jpg",
        };
        event.response.privateChallengeParameters = {
            answer: "5",
        };
        event.response.challengeMetadata = "CAPTCHA_CHALLENGE";
    }
    return event;
};
```

#### Defining a Custom Challenge

This example defines a custom challenge:

```js
export const handler = async (event) => {
    if (!event.request.session || event.request.session.length === 0) {
        // If we don't have a session or it is empty then send a CUSTOM_CHALLENGE
        event.response.challengeName = "CUSTOM_CHALLENGE";
        event.response.failAuthentication = false;
        event.response.issueTokens = false;
    } else if (event.request.session.length === 1 && event.request.session[0].challengeResult === true) {
        // If we passed the CUSTOM_CHALLENGE then issue token
        event.response.failAuthentication = false;
        event.response.issueTokens = true;
    } else {
        // Something is wrong. Fail authentication
        event.response.failAuthentication = true;
        event.response.issueTokens = false;
    }

    return event;
};
```

**Verify Challenge Response** 

This Lambda is used to verify a challenge answer:

```js
export const handler = async (event, context) => {
    if (event.request.privateChallengeParameters.answer === event.request.challengeAnswer) {
        event.response.answerCorrect = true;
    } else {
        event.response.answerCorrect = false;
    }

    return event;
};
```

For more information about working with Lambda Triggers for custom authentication challenge, please visit [Amazon Cognito Developer Documentation](https://docs.aws.amazon.com/cognito/latest/developerguide/user-pool-lambda-challenge.html).
{: .callout .callout--info}

#### Using a Custom Challenge

To initiate a custom authorization flow in your app, call `signIn` without a password. A custom challenge needs to be answered using the `sendCustomChallengeAnswer` method:

```js
import { Auth } from 'aws-amplify';
let challengeResponse = "the answer for the challenge";

Auth.signIn(username)
    .then(user => {
        if (user.challengeName === 'CUSTOM_CHALLENGE') {
            Auth.sendCustomChallengeAnswer(user, challengeResponse)
                .then(user => console.log(user))
                .catch(err => console.log(err));
        } else {
            console.log(user);
        }
    })
    .catch(err => console.log(err));
```

### Migrating Users to Amazon Cognito

Cognito provides a trigger to migrate users from your existing user directory to Cognito seamlessly. You configure your Cognito User Pool's "Migration" trigger to invoke a Lambda function whenever a user that does not already exist in the user pool signs in or resets their password. 

In short, the Lambda function should validate the user credentials against your existing user directory and return a response object containing user attributes and status on success, or an error message on error. There's a good documentation [here](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-pools-import-using-lambda.html) on how to set up this migration flow and a more detailed instruction [here](https://docs.aws.amazon.com/cognito/latest/developerguide/user-pool-lambda-migrate-user.html#cognito-user-pools-lambda-trigger-syntax-user-migration) on how the lambda should handle request and response objects.

The default authentication flow encrypts the user password before it's sent to Cognito, meaning your triggered Lambda won't receive a user password that can be validated. If you want to be able to migrate users on signin, you need to configure your user pool and application to use the `USER_PASSWORD_AUTH` authentication flow. See section [Switching Authentication Flow Type](#switching-authentication-flow-type) for instructions.

### Working with User Attributes

You can pass user attributes during sign up:

```js
Auth.signUp({
    'username': 'jdoe',
    'password': 'mysecurerandompassword#123',
    'attributes': {
        'email': 'me@domain.com',
        'phone_number': '+12128601234', // E.164 number convention
        'given_name': 'Jane',
        'family_name': 'Doe',
        'nickname': 'Jane'
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
    'family_name': 'Lastname'
});
console.log(result); // SUCCESS
```

If you change the email address, the user you will receive a confirmation code. In your app, you can confirm the verification code:

```js
let result = await Auth.verifyCurrentUserAttributeSubmit('email', 'abc123');
```

### Subscribing Events

You can take specific actions when users sign-in or sign-out by subscribing authentication events in your app. Please see our [Hub Module Developer Guide]({%if jekyll.environment == 'production'%}{{site.amplify.docs_baseurl}}{%endif%}/media/hub_guide#listening-authentication-events) for more information.


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

Note: To work with Service Interface Objects, your Amazon Cognito users' [IAM role](https://docs.aws.amazon.com/cognito/latest/developerguide/iam-roles.html) must have the appropriate permissions to call the requested services.
{: .callout .callout--warning}


### API Reference

For the complete API documentation for Authentication module, visit our [API Reference]({%if jekyll.environment == 'production'%}{{site.amplify.docs_baseurl}}{%endif%}/api/classes/authclass.html)
{: .callout .callout--info}

## Customization

### Customize UI Theme

AWS Amplify's default UI components are theme based. To see the default styling, check  `AmplifyTheme.js` for the related package in our repo.

You can create your own theme, and use it to render Amplify components:

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

A sample theme can be found [here](https://github.com/richardzcode/a-theme-react).
{: .callout .callout--info}

### Create Your Own UI

To customize the default auth experience even more, you can create your own auth UI. To do this, your component will leverage the following *Authenticator* properties:

```
- authState
- authData
- onStateChange
```

The following example creates an 'Always On' Auth UI, which continuously shows the current auth state in your app.

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

### Composing Your Own Authenticator

`Authenticator` is designed as a container for a number of Auth components. Each component does a single job, e.g., SignIn, SignUp, etc. By default, all of this elements are visible depending on the authentication state. 

If you want to replace some or all of the Authenticator elements, you need to set `hideDefault={true}`, so the component doesn't render its default view. Then you can pass in your own set of child components that listen to `authState` and decide what to do. 

You can also pass the child components you want to use. For example, the following Authenticator configuration only renders *Greetings* component which has a *Sign Out* button:

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

### Customize `withAuthenticator`

The `withAuthenticator` HOC gives you some nice default authentication screens out-of-box. If you want to use your own components rather then provided default components, you can pass the list of customized components to `withAuthenticator`:

```js
import React, { Component } from 'react';
import { ConfirmSignIn, ConfirmSignUp, ForgotPassword, SignIn, SignUp, VerifyContact, withAuthenticator } from 'aws-amplify-react';

class App extends Component {
  render() {
    ...
  }
}

// This is my custom Sign in component
class MySignIn extends SignIn {
  render() {
    ...
  }
}

export default withAuthenticator(App, false, [
  <MySignIn/>,
  <ConfirmSignIn/>,
  <VerifyContact/>,
  <SignUp/>,
  <ConfirmSignUp/>,
  <ForgotPassword/>
]);
```

### Customize Error Messages

During authentication flows, Amplify handles error messages returned from the server. Amplify provides a simple way of customizing those error messages with a `messageMap` callback.

The function takes the original message as arguments and then outputs the desired message. Check `AmplifyMessageMap.js` file to see how Amplify makes the map function.

```jsx
const map = (message) => {
    if (/incorrect.*username.*password/i.test(message)) {
        return 'Incorrect username or password';
    }

    return message;
}

<Authenticator errorMessage={map} />
```

You may notice in `AmplifyMessageMap.js` it also handles internationalization. This topic is covered in our [I18n Guide]({%if jekyll.environment == 'production'%}{{site.amplify.docs_baseurl}}{%endif%}/media/i18n_guide).

### Customize Text Labels

You can change the text for the labels (like 'Sign In' and 'Sign Up') on the built-in user interface by providing your own dictionary to the localization engine:

```jsx
import { I18n } from 'aws-amplify';

const authScreenLabels = {
    en: {
        'Sign Up': 'Create new account',
        'Sign Up Account': 'Create a new account'
    }
};

I18n.setLanguage('en');
I18n.putVocabularies(authScreenLabels);
```


### Customize Initial authState

You can change the initial auth state for your Authenticator. By default the initial state is `signIn` which will shows the `signIn` component.
If you want the `signUp` component shows first, you can do:
```jsx
<Authenticator authState='signUp'>
```

## Using Modular Imports

If you only need to use Auth, you can do: `npm install @aws-amplify/auth` which will only install the Auth module for you.

Then in your code, you can import the Auth module by:
```js
import Auth from '@aws-amplify/auth';

Auth.configure();
```
