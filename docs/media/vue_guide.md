---
---

# Vue

Vue.js support is currently in beta and installable via `aws-amplify-vue@beta` from npm.
{: .callout .callout--info}

The ```aws-amplify-vue``` package is a set of Vue components which integrates your Vue application with the AWS-Amplify library. It is intended for use with Vue applications using version 2.5 or above, and was created using the Vue 3.0 CLI.

## Configuration 

In your Vue app, install the following:

```bash
npm i aws-amplify@beta 
npm i aws-amplify-vue@beta
```

Then, alter main.js:

```js
import * as AmplifyModules from 'aws-amplify';
import * as AmplifyVue from 'aws-amplify-vue';
import aws_exports from './aws-exports';
Amplify.configure(aws_exports)

Vue.use(AmplifyVue.plugins.amplifyPlugin, {AmplifyModules});

// It's important that you instantiate the Vue instance after calling Vue.use!

new Vue({
  render: h => h(App)
}).$mount('#app')

```

In App.vue:

```js
<script>
import { components } from 'aws-amplify-vue'

export default {
  name: 'app', 
  components: {
    ...<yourOtherComponents>,
    ...components
  }
}
</script>

```

## AmplifyEventBus

The aws-amplify-vue package implments a Vue EventBus for emitting and listening to events within it's components.  The events emmitted by the components are listed within the documentation for each individual component.

To listen to these events within one of your components, import the EventBus:

```js
import { AmplifyEventBus } from 'aws-amplify-vue';
```

Then, register an event listener (potentially within a lifecycle hook):

```js
AmplifyEventBus.$on('authState', info => {
  console.log(`Here is the auth event that was just emitted by an Amplify component: ${info}`)
});
```

## AmplifyPlugin

The aws-amplify-vue package provides a Vue plugin to access the Amplify library.  You installed the plugin when you set up your application:

```Vue.use(AmplifyVue.plugins.amplifyPlugin, {AmplifyModules})```

This makes the Amplify library available to the aws-amplify-vue components as well as to your application.  Please note that you can restict the modules that are made available to the plugin by passing only specific modules in the second argument of ```Vue.use``` call.

### Using the AmplifyPlugin

To call the Amplify library, simply use ``this.$Amplify.`` followed by whichever module you wish to use.


## Authentication Components

### Authenticator

The Authenticator component provides basic basic login/logout functionality for your application, as well confirmation steps for new user registration and user login. It uses the following components as children:

* SignIn
* ConfirmSignIn
* SignUp
* ConfirmSignUp
* ForgotPassword


Usage: ```<amplify-authenticator></amplify-authenticator>```

Options: 

```js

<amplify-authenticator v-bind:authOptions="authOptions"></amplify-authenticator>

authOptions = {
  confirmSignInOptions: {
    header: 'This is a label at the top of the component',  // type: string, default: 'Confirm Sign In', required: false
    user: 'The user who is attempting to log in', // type: object, default: user who completed sign in step, required: **true**
  },
  confirmSignUpOptions: {
    header: 'This is a label at the top of the component',  // type: string, default: 'Confirm Sign Up', required: false
    username: 'The username of the user who is attempting to sign up', // type: string, default: username of user who completed sign up step, required: false
  },
  forgotPasswordOptions: {
    header: 'This is a label at the top of the component',  // type: string, default: 'Forgot Password', required: false
  },
  signInOptions: {
    username: 'This is the default value for the username input field', // type: string, default: '' (unless user has completed signup actions), required: false
    header: 'This is a label at the top of the component',  // type: string, default: 'Sign In', required: false
  },
  signOutOptions: {
    msg: 'This is a message that appears above the sign out button', // type: string, default: null
    signOutButton: 'This is a label on the signout button', // type: string, default: 'Sign Out', required: false
  },
  signUpOptions: {
    header: 'This is a label at the top of the component',  // type: string, default: 'Sign Up', required: false
  },

}
```

Events: None

### SignIn

The SignIn component provides your users with the ability to sign in.  

Usage: ```<amplify-sign-in></amplify-sign-in>```

Options:

```js
<amplify-sign-in v-bind:signInOptions="signInOptions"></amplify-sign-in>

signInOptions = {
  username: 'This is the default value for the username input field', // type: string, default: '', required: false
  header: 'This is a label at the top of the component'  // type: string, default: 'Sign In', required: false
}
```

Events: 

* ```AmplifyEventBus.$emit('authState', 'signedIn')```: Emitted when a user successfully signs in without answering an MFA challenge.
* ```AmplifyEventBus.$emit('authState', 'confirmSignIn')```: Emitted when a user successfully provides their credentials but is then asked to answer and MFA challenge.
* ```AmplifyEventBus.$emit('authState', 'forgotPassword')```: Emitted when a user clicks the 'Forgot Password' button.
* ```AmplifyEventBus.$emit('authState', 'signUp')```: Emitted when a user clicks 'Back to Sign Up'.

### ConfirmSignIn

The SignIn component provides your users with the ability answer an MFA challenge.  

Usage: ```<amplify-confirm-sign-in></amplify-confirm-sign-in>```

Options:

```js

<amplify-sign-in v-bind:confirmSignInOptions="confirmSignInOptions"></amplify-sign-in>

confirmSignInOptions = {
  header: 'This is a label at the top of the component',  // type: string, default: 'Sign In', required: false
  user: 'The user who is attempting to log in', // type: object, default: {}, required: **true**
}
```

Events: 

* ```AmplifyEventBus.$emit('authState', 'signedIn')```: Emitted when a user successfully answers their MFA challenge.
* ```AmplifyEventBus.$emit('authState', 'signedOut');```: Emitted when a user clicks 'Back to Sign In'.


### SignUp

The SignUp component provides your users with the ability to sign up.  

Usage: ```<amplify-sign-up></amplify-sign-up>```

Options:

```js
<amplify-sign-up v-bind:signUpOptions="signUpOptions"></amplify-sign-up>

signUpOptions = {
  header: 'This is a label at the top of the component'  // type: string, default: 'Sign Up'
}
```

Events: 

* ```AmplifyEventBus.$emit('authState', 'confirmSignUp')```: Emitted when a user successfully enters their information but has not yet completed a required verification step.
* ```AmplifyEventBus.$emit('authState', 'signedOut')```: Emitted when a user successfully provides their information and does not need to complete a required verfication step, or when they click 'Back to Sign In'.


### ConfirmSignUp

The ConfirmSignUp component provides your users with the ability to verify their identity.  

Usage: ```<amplify-confirm-sign-up></amplify-confirm-sign-up>```

Options:

```js
<amplify-sign-in v-bind:confirmSignUpOptions="confirmSignUpOptions"></amplify-sign-in>

confirmSignUpOptions = {
  header: 'This is a label at the top of the component',  // type: string, default: 'Sign In', required: false
  username: 'The username of the user who is attempting to sign up', // type: string, default: '', required: false
}
```

Events: 

* ```AmplifyEventBus.$emit('authState', 'signedOut')```: Emitted when a user successfully completes their verification step or clicks 'Back to Sign In'.

### ForgotPassword

The ForgotPassword component provides your users with the ability to reset their password.  

Usage: ```<amplify-forgot-password></amplify-forgot-password>```

Options:

```js
<amplify-forgot-password v-bind:forgotPasswordOptions="forgotPasswordOptions"></amplify-forgot-password>

forgotPasswordOptions = {
  header: 'This is a label at the top of the component',  // type: string, default: 'Forgot Password', required: false
}
```

Events: 

* ```AmplifyEventBus.$emit('authState', 'signedOut')```: Emitted when a user successfully resets their password or clicks 'Back to Sign In'.

### SignOut

The ForgotPassword component provides your users with the ability to sign out.  

Usage: ```<amplify-sign-out></amplify-sign-out>```

Options:

```js
<amplify-sign-out v-bind:signOutOptions="signOutOptions"></amplify-sign-out>

signOutOptions = {
  msg: 'A message displayed above the sign out button',  // type: string, default: null, required: false
  signOutButton: 'The text that appears in the sign out button', // type: string, default: 'Sign Out', required: false
}
```

Events: 

* ```AmplifyEventBus.$emit('authState', 'signedOut')```: Emitted when a user successfully signs out.

### SetMFA

The SetMFA component provides your users with the ability to set their preferrend Multifactor Authentication (MFA) method.  It has the ability to show three options - SMS Text Message, TOTP, or None (depending on the options that you pass into it).

Usage: ```<amplify-set-mfa></amplify-set-mfa>```

Options:

```js
<amplify-set-mfa v-bind:mfaOptions="mfaOptions"></amplify-set-mfa>

mfaOptions = {
  mfaDescription: 'This is a description of MFA for your users', // type: string, default: 'AWS Multi-Factor Authentication (MFA) adds an extra layer of protection on top of your user name and password.',
  mfaTypes: ['An array of MFA types'], // type: array, default: [], possible values: 'SMS', 'TOTP', 'None'
  tokenInstructions: 'These are instructions for decoding the QR code used with TOTP', // type: string, default: 'Scan the QR Code with your phone camera or authentication app to get the MFA code',
  smsDescription: 'A description of SMS for your users', // type: string, default: 'SMS text messaging (receive a code on your mobile device)',
  totpDescription: 'A description of TOTP for your users', // type: string, default: 'One-time password (use a QR code and MFA app to save a token on your mobile device)',
  noMfaDescription: 'A description of no MFA for your users', // type: string, default: 'Do not enable MFA'
}

```

Events: None

## Storage Components

### PhotoPicker

The PhotoPicker component provides your users to select and preview a file for upload to S3.

Usage: ```<amplify-photo-picker></amplify-photo-picker>```

Options:

```js
<amplify-photo-picker v-bind:photoPickerOptions="photoPickerOptions"></amplify-photo-picker>

photoPickerOptions = {
  header: 'This is a label at the top of the component',  // type: string, default: 'File Upload', required: false
  title: 'This is the text displayed in the upload button', // type: string, default 'Upload', required: false
  accept: 'A string representing the "accept" value for the input element', // type: string, default: '*/*', required: false
  path: 'The S3 path for the file upload', // type: string, default: none, required: **true**
}
```

Events:

* ```AmplifyEventBus.$emit('fileUpload', img)```: Emitted when a file is uploaded (includes the image path)


### S3Album

The S3Album component displays the image files from the provided S3 path.

Usage: ```<amplify-s3-album path="uploads"></amplify-s3-album>```

Props:
```
path = 'The S3 path from which the images should be retrieved' // type: string, default: none, required: **true**
```

Events: None

### S3Image

The S3Image component displays the a single image from the provided path.

Usage: ```<amplify-s3-album imagePath="path"></amplify-s3-album>```

Props:
```
imagePath = 'The S3 path from which the image should be retrieved' // type: string, default: none, required: **true**
```
Events: None

## Interaction Components

### Chatbot

The Chatbot component allows your users to interact with an Amazon Lex chatbot.

Usage: ```<amplify-chatbot></amplify-chatbot>```

Options:

```js
<amplify-chatbot v-bind:chatbotOptions="chatbotOptions"></amplify-chatbot>

chatbotOptions = {
  bot: 'The name of the chatbot as defined in your Amplify configuration under "aws_bots_config.name"', // type: string, default: none, required: **true**
  clearComplete: true, // type: boolean, default: true, required: false
  botTitle: 'The name of the chatbot component in your frontend app' // type: string, default: 'Chatbot', required: false
}
```

Events:

* ```AmplifyEventBus.$emit('chatComplete', this.options.botTitle)```: Emitted when a chat session has been completed (only if the clearComplete options is 'true')