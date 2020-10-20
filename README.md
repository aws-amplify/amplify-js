<img src="https://s3.amazonaws.com/aws-mobile-hub-images/aws-amplify-logo.png" alt="AWS Amplify" width="550" >

<a href="https://nodei.co/npm/aws-amplify/">
  <img src="https://nodei.co/npm/aws-amplify.svg?downloads=true&downloadRank=true&stars=true">
</a>
<p>
  <a href="https://discord.gg/jWVbPfC" target="_blank">
    <img src="https://img.shields.io/discord/308323056592486420?logo=discord"" alt="Discord Chat" />  
  </a>
  <a href="https://codecov.io/gh/aws-amplify/amplify-js">
    <img src="https://codecov.io/gh/aws-amplify/amplify-js/branch/main/graph/badge.svg" />
  </a>
  <a href="https://lgtm.com/projects/g/aws-amplify/amplify-js/context:javascript"><img alt="Language grade: JavaScript" src="https://img.shields.io/lgtm/grade/javascript/g/aws-amplify/amplify-js.svg?logo=lgtm&logoWidth=18"/>
  </a>
  <a href="https://circleci.com/gh/aws-amplify/amplify-js">
    <img src="https://img.shields.io/circleci/project/github/aws-amplify/amplify-js/main.svg" alt="build:started">
  </a>
</p>

### Reporting Bugs/Feature Requests
[![Open Bugs](https://img.shields.io/github/issues/aws-amplify/amplify-js/bug?color=d73a4a&label=bugs)](https://github.com/aws-amplify/amplify-js/issues?q=is%3Aissue+is%3Aopen+label%3Abug)
[![Feature Requests](https://img.shields.io/github/issues/aws-amplify/amplify-js/feature-request?color=ff9001&label=feature%20requests)](https://github.com/aws-amplify/amplify-js/issues?q=is%3Aissue+label%3Afeature-request+is%3Aopen)
[![Closed Issues](https://img.shields.io/github/issues-closed/aws-amplify/amplify-js?color=%2325CC00&label=issues%20closed)](https://github.com/aws-amplify/amplify-js/issues?q=is%3Aissue+is%3Aclosed+)

### AWS Amplify is a JavaScript library for frontend and mobile developers building cloud-enabled applications

AWS Amplify provides a declarative and easy-to-use interface across different categories of cloud operations. AWS Amplify goes well with any JavaScript based frontend workflow, and React Native for mobile developers.

Our default implementation works with Amazon Web Services (AWS), but AWS Amplify is designed to be open and pluggable for any custom backend or service.

## Notice:

### Amplify@3.x.x has breaking changes. Please see the breaking changes below:

- `AWS.credentials` and `AWS.config` don’t exist anymore anywhere in Amplify JS
  - Both options will not be available to use in version 3. You will not be able to use and set your own credentials. Migration plan on “How to migrate to using Amplify provided credentials” will follow in the coming weeks after GA launch.
- `aws-sdk@2.x` has been removed from `Amplify@3.x.x` in favor of [version 3 of aws-sdk-js](https://github.com/aws/aws-sdk-js-v3). We recommend to migrate to [aws-sdk-js-v3](https://github.com/aws/aws-sdk-js-v3) if you rely on AWS services that are not supported by Amplify, since [aws-sdk-js-v3](https://github.com/aws/aws-sdk-js-v3) is imported modularly.

If you can't migrate to [aws-sdk-js-v3](https://github.com/aws/aws-sdk-js-v3) or rely on aws-sdk@2.x, you will need to import it separately.

- If you are using exported paths within your Amplify JS application, (e.g. `import from "@aws-amplify/analytics/lib/Analytics"`) this will now break and no longer will be supported. You will need to change to named imports:

  ```js
  import { Analytics } from 'aws-amplify';
  ```

- If you are using categories as `Amplify.<Category>`, this will no longer work and we recommend to import the category you are needing to use:

  ```js
  import { Auth } from 'aws-amplify';
  ```

  - The one exception to this is using `aws-amplify-angular` package where we are still supplying all instantiated categories. This is subject to change in a later release.

- For `aws-amplify-react`'s `Authenticator` Component, you will need to import the styles within your app:

  ```js
  import `@aws-amplify/ui/dist/style.css`;
  ```

### Features / APIs

- [**Authentication**](https://docs.amplify.aws/lib/auth/getting-started/q/platform/js): APIs and building blocks for developers who want to create user authentication experiences.
- [**Analytics**](https://docs.amplify.aws/lib/analytics/getting-started/q/platform/js): Easily collect analytics data for your app. Analytics data includes user sessions and other custom events that you want to track in your app.
- [**REST API**](https://docs.amplify.aws/lib/restapi/getting-started/q/platform/js): Provides a simple solution when making HTTP requests. It provides an automatic, lightweight signing process which complies with AWS Signature Version 4.
- [**GraphQL API**](https://docs.amplify.aws/lib/graphqlapi/getting-started/q/platform/js): Interact with your GraphQL server or AWS AppSync API with an easy-to-use & configured GraphQL client.
- [**Storage**](https://docs.amplify.aws/lib/storage/getting-started/q/platform/js): Provides a simple mechanism for managing user content for your app in public, protected or private storage buckets.
- [**Push Notifications**](https://docs.amplify.aws/lib/push-notifications/getting-started/q/platform/js): Allows you to integrate push notifications in your app with Amazon Pinpoint targeting and campaign management support.
- [**Interactions**](https://docs.amplify.aws/lib/interactions/getting-started/q/platform/js#interactions-with-aws): Create conversational bots powered by deep learning technologies.
- [**PubSub**](https://docs.amplify.aws/lib/pubsub/getting-started/q/platform/js): Provides connectivity with cloud-based message-oriented middleware.
- [**Internationalization**](https://docs.amplify.aws/lib/utilities/i18n/q/platform/js): A lightweight internationalization solution.
- [**Cache**](https://docs.amplify.aws/lib/utilities/cache/q/platform/js): Provides a generic LRU cache for JavaScript developers to store data with priority and expiration settings.
- [**Predictions**](https://docs.amplify.aws/lib/predictions/getting-started/q/platform/js): Provides a solution for using AI and ML cloud services to enhance your application.

#### Visit our [Web Site](https://docs.amplify.aws/) to learn more about AWS Amplify.

- [Documentation](https://docs.amplify.aws/)
- [Installation](#installation)
- [Configuration](#configuration)
- [Demo Applications](https://github.com/aws-amplify/amplify-js-samples)
- [Examples](#examples)
- [Contributing](https://github.com/aws-amplify/amplify-js/blob/main/CONTRIBUTING.md)

## Installation

AWS Amplify is available as `aws-amplify` package on [npm](https://www.npmjs.com/).

**Web**

```bash
$ npm install aws-amplify --save
```

or you could install the module you want to use individually:

```bash
$ npm install @aws-amplify/auth --save
```

**React**

If you are developing a [React](https://github.com/facebook/react/) app, you can install an additional package `aws-amplify-react` containing [Higher Order Components](https://reactjs.org/docs/higher-order-components.html):

```bash
$ npm install aws-amplify --save
$ npm install aws-amplify-react --save
```

**Angular**

If you are developing an [Angular](https://github.com/angular/angular) app, you can install an additional package `aws-amplify-angular`. This package contains an [Angular module](https://angular.io/guide/architecture-modules) with a [provider and components](https://docs.amplify.aws/start/q/integration/angular):

```bash
$ npm install aws-amplify --save
$ npm install aws-amplify-angular --save
```

Visit our [Installation Guide for Web](https://docs.amplify.aws/start) to start building your web app.

**Vue**

If you are developing a [Vue](https://github.com/vuejs/vue) app, you can install an additional package `aws-amplify-vue`. This package contains a [Vue plugin](https://vuejs.org/v2/guide/plugins.html) for the Amplify library along with [Vue components](https://vuejs.org/v2/guide/components.html):

```bash
$ npm install aws-amplify --save
$ npm install aws-amplify-vue --save
```

Visit our [Installation Guide for Web](https://docs.amplify.aws/start/q/integration/vue) to start building your Vue app.

**React Native**

For React Native development, install `aws-amplify`:

```bash
$ npm install aws-amplify --save
```

If you are developing a [React Native](https://github.com/facebook/react-native) app, you can install an additional package `aws-amplify-react-native` containing [Higher Order Components](https://reactjs.org/docs/higher-order-components.html):

```bash
$ npm install aws-amplify-react-native --save
```

Visit our [Installation Guide for React Native](https://docs.amplify.aws/start/q/integration/react) to start building your web app.

## Configuration

Somewhere in your app, preferably at the root level, configure Amplify with your resources.

**Using AWS Resources**

```js
import Amplify from 'aws-amplify';
import aws_exports from './aws-exports';

Amplify.configure(aws_exports);

// or if you don't want to install all the categories
import Amplify from '@aws-amplify/core';
import Auth from '@aws-amplify/auth';
import aws_exports from './aws-exports';

// in this way you are only importing Auth and configuring it.
Amplify.configure(aws_exports);
```

**Without AWS**

```js
Amplify.configure({
	API: {
		graphql_endpoint: 'https://www.example.com/my-graphql-endpoint',
	},
});
```

## Examples

AWS Amplify supports many category scenarios such as Auth, Analytics, APIs and Storage as outlined in the [Developer Guide](https://docs.amplify.aws/start). A couple of samples are below:

### 1. Collect user session metrics

By default, AWS Amplify can collect user session tracking data with a few lines of code:

```js
import Analytics from '@aws-amplify/analytics';

Analytics.record('myCustomEvent');
```

See our [Analytics Developer Guide](https://docs.amplify.aws/lib/analytics/getting-started/q/platform/js) for detailed information.

### 2. Add Authentication to your App

Add user sign up and sign in using two of the many methods available to the [Auth class](https://aws-amplify.github.io/amplify-js/api/classes/authclass.html):

```js
import Auth from '@aws-amplify/auth';

Auth.signUp({
	username: 'AmandaB',
	password: 'MyCoolPassword1!',
	attributes: {
		email: 'someemail@example.com',
	},
});

Auth.signIn(username, password)
	.then(success => console.log('successful sign in'))
	.catch(err => console.log(err));
```

See our [Authentication Developer Guide](https://docs.amplify.aws/lib/auth/getting-started/q/platform/js) for detailed information.

**React / React Native**

Adding authentication to your React or React Native app is as easy as wrapping your app's main component with our `withAuthenticator` higher order component. AWS Amplify will provide you customizable UI for common use cases such as user registration and login.

```jsx
// For React
import { withAuthenticator } from 'aws-amplify-react';

// For React Native
import { withAuthenticator } from 'aws-amplify-react-native';

export default withAuthenticator(App);
```

**Angular**

To add authentication to your Angular app you can also use the built-in service provider and components:

```js
// app.component.ts
import { AmplifyService }  from 'aws-amplify-angular';

...

constructor( public amplify:AmplifyService ) {
  // handle auth state changes
  this.amplify.authStateChange$
    .subscribe(authState => {
      this.authenticated = authState.state === 'signedIn';
      if (!authState.user) {
        this.user = null;
      } else {
        this.user = authState.user;
      }
  });
}

// app.component.html
<amplify-authenticator></amplify-authenticator>

```

See our [Angular Guide](https://docs.amplify.aws/start/q/integration/angular) for more details on Angular setup and usage.

### 3. Sign HTTP requests

AWS Amplify automatically signs your REST requests with [AWS Signature Version 4](http://docs.aws.amazon.com/general/latest/gr/signature-version-4.html) when using the API module:

```js
import API from '@aws-amplify/api';

let apiName = 'MyApiName';
let path = '/path';
let options = {
  headers: {...} // OPTIONAL
}
API.get(apiName, path, options).then(response => {
  // Add your code here
});
```

See our [REST API Developer Guide](https://docs.amplify.aws/lib/restapi/getting-started/q/platform/js) for detailed information.

### 4. GraphQL API Operations

To access a GraphQL API with your app, you need to make sure to configure the endpoint URL in your app’s configuration.

```js
// configure a custom GraphQL endpoint
Amplify.configure({
	API: {
		graphql_endpoint: 'https://www.example.com/my-graphql-endpoint',
	},
});

// Or configure an AWS AppSync endpoint.
let myAppConfig = {
	// ...
	aws_appsync_graphqlEndpoint:
		'https://xxxxxx.appsync-api.us-east-1.amazonaws.com/graphql',
	aws_appsync_region: 'us-east-1',
	aws_appsync_authenticationType: 'API_KEY',
	aws_appsync_apiKey: 'da2-xxxxxxxxxxxxxxxxxxxxxxxxxx',
	// ...
};

Amplify.configure(myAppConfig);
```

**queries**

```js
import API, { graphqlOperation } from '@aws-amplify/api';

const ListEvents = `query ListEvents {
  listEvents {
    items {
      id
      where
      description
    }
  }
}`;

const allEvents = await API.graphql(graphqlOperation(ListEvents));
```

**mutations**

```js
import API, { graphqlOperation } from '@aws-amplify/api';

const CreateEvent = `mutation CreateEvent($name: String!, $when: String!, $where: String!, $description: String!) {
  createEvent(name: $name, when: $when, where: $where, description: $description) {
    id
    name
    where
    when
    description
  }
}`;

const eventDetails = {
	name: 'Party tonight!',
	when: '8:00pm',
	where: 'Ballroom',
	description: 'Coming together as a team!',
};

const newEvent = await API.graphql(graphqlOperation(CreateEvent, eventDetails));
```

**subscriptions**

```js
import API, { graphqlOperation } from '@aws-amplify/api';

const SubscribeToEventComments = `subscription subscribeToComments {
  subscribeToComments {
    commentId
    content
  }
}`;

const subscription = API.graphql(
	graphqlOperation(SubscribeToEventComments)
).subscribe({
	next: eventData => console.log(eventData),
});
```

See our [GraphQL API Developer Guide](https://docs.amplify.aws/lib/graphqlapi/getting-started/q/platform/js) for detailed information.

### 5. Upload and Download public or private content

AWS Amplify provides an easy-to-use API to store and get content from public or private storage folders:

```js
Storage.put(key, fileObj, { level: 'private' })
	.then(result => console.log(result))
	.catch(err => console.log(err));

// Store data with specifying its MIME type
Storage.put(key, fileObj, {
	level: 'private',
	contentType: 'text/plain',
})
	.then(result => console.log(result))
	.catch(err => console.log(err));
```

See our [Storage Developer Guide](https://docs.amplify.aws/lib/storage/getting-started/q/platform/js) for detailed information.
