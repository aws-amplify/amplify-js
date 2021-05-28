# AWS Amplify Package - aws-amplify-vue

The `aws-amplify-vue` package is a set of Vue components which integrates your Vue application with the AWS-Amplify library.

It is intended for use with Vue applications using version 2.5 or above, and was created using the Vue 3.0 CLI.

## Setup

In your Vue app, install the following:

```
npm i aws-amplify aws-amplify-vue
```

Then, alter main.js:

```
import Amplify, * as AmplifyModules from 'aws-amplify';
import { AmplifyPlugin } from 'aws-amplify-vue';
import aws_exports from './aws-exports';
Amplify.configure(aws_exports)

Vue.use(AmplifyPlugin, AmplifyModules);

// It's important that you instantiate the Vue instance after calling Vue.use!

new Vue({
  render: h => h(App)
}).$mount('#app')

```

In App.vue:

```
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

The aws-amplify-vue package implements a Vue EventBus for emitting and listening to events within it's components. The events emmitted by the components are listed within the documentation for each individual component.

To listen to these events within one of your components, import the EventBus:

```
import { AmplifyEventBus } from 'aws-amplify-vue';
```

Then, register an event listener (potentially within a lifecycle hook):

```
AmplifyEventBus.$on('authState', info => {
  console.log(`Here is the auth event that was just emitted by an Amplify component: ${info}`)
});
```

## AmplifyPlugin

The aws-amplify-vue package provides a Vue plugin to access the Amplify library. You installed the plugin when you set up your application:

`Vue.use(AmplifyPlugin, AmplifyModules);`

This makes the Amplify library available to the aws-amplify-vue components as well as to your application. Please note that you can restrict the modules that are made available to the plugin by passing only specific modules in the second argument of `Vue.use` call.

### Using the AmplifyPlugin

To call the Amplify library, simply use `this.$Amplify.` followed by whichever module you wish to use.

## Authentication Components

### Authenticator

The Authenticator component provides basic login/logout functionality for your application, as well confirmation steps for new user registration and user login. It uses the following components as children:

- SignIn
- ConfirmSignIn
- SignUp
- ConfirmSignUp
- ForgotPassword

Usage: `<amplify-authenticator></amplify-authenticator>`

Config:

```
<amplify-authenticator v-bind:authConfig="authConfig"></amplify-authenticator>
```

| Attribute                               | Type   |
| --------------------------------------- | ------ |
| [confirmSignInConfig](#confirmsignin)   | object |
| [confirmSignUpConfig](#confirmsignup)   | object |
| [forgotPasswordConfig](#forgotpassword) | object |
| [signInConfig](#signinconfig)           | object |
| [signUpConfig](#signupconfig)           | object |

\* The attributes above reference the config objects for the components that are nested inside Authenticator. See the individual components for details.

Events: None

### SignIn

The SignIn component provides your users with the ability to sign in.

Usage: `<amplify-sign-in></amplify-sign-in>`

Config:

```
<amplify-sign-in v-bind:signInConfig="signInConfig"></amplify-sign-in>
```

| Attribute | Type   | Description                             | Default   | Required |
| --------- | ------ | --------------------------------------- | --------- | -------- |
| header    | string | the component header                    | 'Sign In' | no       |
| username  | string | the default value of the username field | ''        | no       |

Events:

- `AmplifyEventBus.$emit('authState', 'signedIn')`: Emitted when a user successfully signs in without answering an MFA challenge.
- `AmplifyEventBus.$emit('authState', 'confirmSignIn')`: Emitted when a user successfully provides their credentials but is then asked to answer and MFA challenge.
- `AmplifyEventBus.$emit('authState', 'forgotPassword')`: Emitted when a user clicks the 'Forgot Password' button.
- `AmplifyEventBus.$emit('authState', 'signUp')`: Emitted when a user clicks 'Back to Sign Up'.

### ConfirmSignIn

The ConfirmSignIn component provides your users with the ability to answer an MFA challenge.

Usage: `<amplify-confirm-sign-in></amplify-confirm-sign-in>`

Config:

```
<amplify-confirm-sign-in v-bind:confirmSignInConfig="confirmSignInConfig"></amplify-confirm-sign-in>
```

| Attribute | Type   | Description                                         | Default   | Required |
| --------- | ------ | --------------------------------------------------- | --------- | -------- |
| header    | string | the component header                                | 'Sign In' | no       |
| user      | object | the user who is stepping through the signin process | N/A       | yes      |

Events:

- `AmplifyEventBus.$emit('authState', 'signedIn')`: Emitted when a user successfully answers their MFA challenge.
- `AmplifyEventBus.$emit('authState', 'signIn');`: Emitted when a user clicks 'Back to Sign In'.

### SignUp

The SignUp component provides your users with the ability to sign up.

Usage: `<amplify-sign-up></amplify-sign-up>`

Config:

```
<amplify-sign-up v-bind:signUpConfig="signUpConfig"></amplify-sign-up>
```

| Attribute    | Type   | Description                 | Default                     | Required |
| ------------ | ------ | --------------------------- | --------------------------- | -------- |
| header       | string | the component header        | 'Sign Up'                   | no       |
| signUpFields | array  | [see below](#signup-fields) | [see below](#signup-fields) | no       |

Events:

- `AmplifyEventBus.$emit('authState', 'confirmSignUp')`: Emitted when a user successfully enters their information but has not yet completed a required verification step.
- `AmplifyEventBus.$emit('authState', 'signIn')`: Emitted when a user successfully provides their information and does not need to complete a required verification step, or when they click 'Back to Sign In'.

### ConfirmSignUp

The ConfirmSignUp component provides your users with the ability to verify their identity.

Usage: `<amplify-confirm-sign-up></amplify-confirm-sign-up>`

Config:

```
<amplify-sign-in v-bind:confirmSignUpConfig="confirmSignUpConfig"></amplify-sign-in>
```

| Attribute | Type   | Description                               | Default           | Required |
| --------- | ------ | ----------------------------------------- | ----------------- | -------- |
| header    | string | the component header                      | 'Confirm Sign Up' | no       |
| username  | string | the username of the user who is signingup | ''                | no       |

Events:

- `AmplifyEventBus.$emit('authState', 'signIn')`: Emitted when a user successfully completes their verification step or clicks 'Back to Sign In'.

### ForgotPassword

The ForgotPassword component provides your users with the ability to reset their password.

Usage: `<amplify-forgot-password></amplify-forgot-password>`

Config:

```
<amplify-forgot-password v-bind:forgotPasswordConfig="forgotPasswordConfig"></amplify-forgot-password>
```

| Attribute | Type   | Description          | Default           | Required |
| --------- | ------ | -------------------- | ----------------- | -------- |
| header    | string | the component header | 'Forgot Password' | no       |

Events:

- `AmplifyEventBus.$emit('authState', 'signIn')`: Emitted when a user successfully resets their password or clicks 'Back to Sign In'.

### SignOut

The SignOut component provides your users with the ability to sign out.

Usage: `<amplify-sign-out></amplify-sign-out>`

Config:

```
<amplify-sign-out v-bind:signOutConfig="signOutConfig"></amplify-sign-out>
```

| Attribute     | Type   | Description                                 | Default    | Required |
| ------------- | ------ | ------------------------------------------- | ---------- | -------- |
| msg           | string | message displayed above the sign out button | null       | no       |
| signOutButton | string | text that appears in the sign out button    | 'Sign Out' | no       |

Events:

- `AmplifyEventBus.$emit('authState', 'signedOut')`: Emitted when a user successfully signs out.

### SetMFA

The SetMFA component provides your users with the ability to set their preferred Multifactor Authentication (MFA) method. It has the ability to show three options - SMS Text Message, TOTP, or None (depending on the options that you pass into it).

Usage: `<amplify-set-mfa></amplify-set-mfa>`

Config:

```
<amplify-set-mfa v-bind:mfaConfig="mfaConfig"></amplify-set-mfa>
```

| Attribute         | Type     | Description                                                         | Default                                                                                                        | Possible Values       | Required |
| ----------------- | -------- | ------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- | --------------------- | -------- |
| mfaDescription    | string   | description of MFA for your users                                   | AWS Multi-Factor Authentication (MFA) adds an extra layer of protection on top of your user name and password. | N/A                   | no       |
| mfaTypes          | array    | an array of MFA types which will result in a radio button selection | []                                                                                                             | 'SMS', 'TOTP', 'None' | no       |
| tokenInstructions | string   | instructions for decoding the QR code used with TOTP                | 'Scan the QR Code with your phone camera or authentication app to get the MFA code.'                           | N/A                   | no       |
| smsDescription    | string   | label for SMS radio button                                          | 'SMS text messaging (receive a code on your mobile device)'                                                    | N/A                   | no       |
| totpDescription   | string   | label for TOTP radio button                                         | 'One-time password (use a QR code and MFA app to save a token on your mobile device)'                          | N/A                   | no       |
| noMfaDescription  | string   | label for 'None' radio button                                       | 'Do not enable MFA'                                                                                            | N/A                   | no       |
| cancelHandler     | function | function called when user clicks on 'Cancel' button                 | None                                                                                                           | N/A                   | no       |

Events: None

### SignUp Fields

The `aws-amplify-vue` SignUp component allows you to programatically define the user input fields that are displayed to the user. Information entered into these fields will populate the user's record in your User Pool.

Usage:

```
<amplify-sign-up v-bind:signUpConfig="signUpConfig"></amplify-sign-up>
```

| Attribute    | Type   | Description                                                   | Possible Values                |
| ------------ | ------ | ------------------------------------------------------------- | ------------------------------ |
| label        | string | label for the input field                                     | N/A                            |
| key          | string | key name for the attribute as defined in the User Pool        | N/A                            |
| required     | bolean | whether or not the field is required                          | N/A                            |
| displayOrder | number | number indicating the order in which fields will be displayed | N/A                            |
| type         | string | the type attribute for the html input element                 | 'string', 'number', 'password' |

By default the SignUp Component will display Username, Password, Email and Phone Number fields (all required, and in that order). You can override the labels, displayOrder or 'required' booleans for these fields by passing objects with 'username', 'password', 'email' or 'phone_number' keys in the signUpConfig.signUpFields array.

Fields passed into the signUpFields array without a displayOrder property will be placed after those fields with defined displayOrders and in alphabetical order by key.

## API Components

### Connect

The Connect component can be used to execute a GraphQL query, subscription, or mutation. You can execute GraphQL queries by passing your queries in `query` or `mutation` attributes. For example:

```
<template>
  <div class="home">
      <amplify-connect :query="listTodosQuery">
        <template slot-scope="{loading, data, errors}">
          <div v-if="loading">Loading...</div>

          <div v-else-if="errors.length > 0">{{ errors }}</div>

          <div v-else-if="data">
            <TodoList :items="data.listTodos.items"></TodoList>
          </div>
        </template>
      </amplify-connect>
  </div>
</template>

<script>
import { components } from 'aws-amplify-vue';
import TodoList from '@/components/TodoList.vue';

const ListTodosQuery = `query ListTodos {
    listTodos {
      items {
        id
        name
      }
    }
  }`;

export default {
  components: {
    TodoList,
    ...components
  },
  computed: {
    listTodosQuery() {
      return this.$Amplify.graphqlOperation(ListTodosQuery);
    }
  }
}
</script>
```

You can also subscribe to changes in query data via the `subscription` and `onSubscriptionMsg` attributes:

```
<template>
  <div class="home">
      <amplify-connect :query="listTodosQuery"
          :subscription="createTodoSubscription"
          :onSubscriptionMsg="onCreateTodo">
        <template slot-scope="{loading, data, errors}">
          <div v-if="loading">Loading...</div>

          <div v-else-if="errors.length > 0">{{ errors }}</div>

          <div v-else-if="data">
            <TodoList :items="data.listTodos.items"></TodoList>
          </div>
        </template>
      </amplify-connect>
  </div>
</template>

<script>
import { components } from 'aws-amplify-vue';
import TodoList from '@/components/TodoList.vue';

const ListTodosQuery = `query ListTodos {
    listTodos {
      items {
        id
        name
      }
    }
  }`;

  const OnCreateTodoSubscription = `subscription OnCreateTodo {
      onCreateTodo {
        id
        name
      }
    }`;

export default {
  name: 'home',
  components: {
    TodoList,
    ...components
  },
  computed: {
    listTodosQuery() {
      return this.$Amplify.graphqlOperation(ListTodosQuery);
    },
    createTodoSubscription() {
      return this.$Amplify.graphqlOperation(OnCreateTodoSubscription);
    }
  },
  methods: {
    onCreateTodo(prevData, newData) {
      console.log('New todo from subscription...');
      const newTodo = newData.onCreateTodo;
      prevData.data.listTodos.items.push(newTodo);
      return prevData.data;
    }
  }
}
</script>
```

The Connect component also supports mutations by passing a GraphQL query and (optionally) variables via the `mutation` attribute. Call the provided `mutate` method to trigger the operation. `mutation` returns a promise that resolves with the result of the GraphQL mutation, use `@done` to listen for it to complete.

```
<template>
  <div>
    <amplify-connect :mutation="createTodoMutation"
        @done="onCreateFinished">
      <template slot-scope="{ loading, mutate, errors }">
        <input v-model="name" placeholder="item name" />
        <input v-model="description" placeholder="item description" />
        <button :disabled="loading" @click="mutate">Create Todo</button>
      </template>
    </amplify-connect>
  </div>
</template>

<script>
import { components } from 'aws-amplify-vue';

const CreateTodoMutation = `mutation CreateTodo($name: String!, $description: String) {
    createTodo(input: { name: $name, description: $description }) {
      id
      name
    }
  }`;

export default {
  name: 'NewTodo',
  components: {
    ...components
  },
  data() {
    return {
      name: '',
      description: ''
    }
  },
  computed: {
    createTodoMutation() {
      return this.$Amplify.graphqlOperation(CreateTodoMutation,
        { name: this.name, description: this.description });
    }
  },
  methods: {
    onCreateFinished() {
      console.log('Todo created!');
    }
  }
}
</script>
```

## Storage Components

### PhotoPicker

The PhotoPicker component provides your users to select and preview a file for upload to S3.

Usage: `<amplify-photo-picker></amplify-photo-picker>`

Config:

```
<amplify-photo-picker v-bind:photoPickerConfig="photoPickerConfig"></amplify-photo-picker>
```

| Attribute   | Type   | Description                                                            | Default            | Required |
| ----------- | ------ | ---------------------------------------------------------------------- | ------------------ | -------- |
| header      | string | the component header                                                   | 'File Upload'      | no       |
| title       | string | text displayed in the upload button                                    | 'Upload'           | no       |
| accept      | string | a string representing the 'accept' attribute in the html input element | '_/_'              | no       |
| path        | string | S3 path for the file upload                                            | N/A                | yes      |
| defaultName | string | the name of the file when uploaded to S3                               | original file name | no       |

Events:

- `AmplifyEventBus.$emit('fileUpload', img)`: Emitted when a file is uploaded (includes the image path)

### S3Album

The S3Album component displays the image files from the provided S3 path.

Usage: `<amplify-s3-album path="uploads"></amplify-s3-album>`

Props:

The S3Album component does not have a config object like most other amplify-vue components. Instead it receives the S3 directory path as a string. The path is required.

Events: None

### S3Image

The S3Image component displays a single image from the provided path.

Usage: `<amplify-s3-image imagePath="path"></amplify-s3-image>`

Props:

The S3Image component does not have a config object like most other amplify-vue components. Instead it receives the S3 image path as a string. The path is required.

Events: None

## Interaction Components

### Chatbot

The Chatbot component allows your users to interact with an Amazon Lex chatbot.

Usage: `<amplify-chatbot></amplify-chatbot>`

Config:

```
<amplify-chatbot v-bind:chatbotConfig="chatbotConfig"></amplify-chatbot>
```

| Attribute     | Type    | Description                                                                                   | Default   | Required |
| ------------- | ------- | --------------------------------------------------------------------------------------------- | --------- | -------- |
| bot           | string  | the name of the chatbot as defined in your Amplify configuration under "aws_bots_config.name" | N/A       | yes      |
| clearComplete | boolean | specifies whether the chat messages clear out at the end of the chat session                  | true      | no       |
| botTitle      | string  | the name of the chatbot component in your frontend app                                        | 'Chatbot' | no       |

If not in your aws.exports file, the bot can also be defined in the AWS configure method:

```
 Interactions: {
    bots: {
      "BookTrip": {
        "name": "BookTrip",
        "alias": "$LATEST",
        "region": "us-east-1",
      },
    }
  }
```

Events:

- `AmplifyEventBus.$emit('chatComplete', this.options.botTitle)`: Emitted when a chat session has been completed (only if the clearComplete options is 'true')
