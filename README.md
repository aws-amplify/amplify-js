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

### Reporting Bugs / Feature Requests

[![Open Bugs](https://img.shields.io/github/issues/aws-amplify/amplify-js/bug?color=d73a4a&label=bugs)](https://github.com/aws-amplify/amplify-js/issues?q=is%3Aissue+is%3Aopen+label%3Abug)
[![Feature Requests](https://img.shields.io/github/issues/aws-amplify/amplify-js/feature-request?color=ff9001&label=feature%20requests)](https://github.com/aws-amplify/amplify-js/issues?q=is%3Aissue+label%3Afeature-request+is%3Aopen)
[![Closed Issues](https://img.shields.io/github/issues-closed/aws-amplify/amplify-js?color=%2325CC00&label=issues%20closed)](https://github.com/aws-amplify/amplify-js/issues?q=is%3Aissue+is%3Aclosed+)

> **Note**
> aws-amplify 5 has been released. If you are looking for upgrade guidance [click here](#notice)

### AWS Amplify is a JavaScript library for frontend and mobile developers building cloud-enabled applications

AWS Amplify provides a declarative and easy-to-use interface across different categories of cloud operations. AWS Amplify goes well with any JavaScript based frontend workflow and React Native for mobile developers.

Our default implementation works with Amazon Web Services (AWS), but AWS Amplify is designed to be open and pluggable for any custom backend or service.

#### Visit our [Documentation site](https://docs.amplify.aws/) to learn more about AWS Amplify. Please see our [Amplify JavaScript](https://docs.amplify.aws/lib/q/platform/js/) page within our Documentation site for information around the full list of features we support.

- [Demo Applications](https://github.com/aws-amplify/amplify-js-samples)
- [Contributing](https://github.com/aws-amplify/amplify-js/blob/main/CONTRIBUTING.md)

### Features

| Category                                                                                                          | AWS Provider                                                | Description                                                                                                            |
| ----------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| [**Authentication**](https://docs.amplify.aws/lib/auth/getting-started/q/platform/js)                             | [Amazon Cognito](https://aws.amazon.com/cognito/)           | APIs and Building blocks to create Authentication experiences.                                                         |
| [**Analytics**](https://docs.amplify.aws/lib/analytics/getting-started/q/platform/js)                             | [Amazon Pinpoint](https://aws.amazon.com/pinpoint/)         | Collect Analytics data for your application including tracking user sessions.                                          |
| [**REST API**](https://docs.amplify.aws/lib/restapi/getting-started/q/platform/js)                                | [Amazon API Gateway](https://aws.amazon.com/api-gateway/)   | Sigv4 signing and AWS auth for API Gateway and other REST endpoints.                                                   |
| [**GraphQL API**](https://docs.amplify.aws/lib/graphqlapi/getting-started/q/platform/js)                          | [AWS AppSync](https://aws.amazon.com/appsync/)              | Interact with your GraphQL or AWS AppSync endpoint(s).                                                                 |
| [**DataStore**](https://docs.amplify.aws/lib/datastore/getting-started/q/platform/js)                             | [AWS AppSync](https://aws.amazon.com/appsync/)              | Programming model for shared and distributed data, with simple online/offline synchronization.                         |
| [**Storage**](https://docs.amplify.aws/lib/storage/getting-started/q/platform/js)                                 | [Amazon S3](https://aws.amazon.com/s3/)                     | Manages content in public, protected, private storage buckets.                                                         |
| [**Geo (Developer preview)**](https://docs.amplify.aws/lib/geo/getting-started/q/platform/js)                     | [Amazon Location Service](https://aws.amazon.com/location/) | Provides APIs and UI components for maps and location search for JavaScript-based web apps.                            |
| [**Push Notifications**](https://docs.amplify.aws/lib/push-notifications/getting-started/q/platform/js)           | [Amazon Pinpoint](https://aws.amazon.com/pinpoint/)         | Allows you to integrate push notifications in your app with Amazon Pinpoint targeting and campaign management support. |
| [**Interactions**](https://docs.amplify.aws/lib/interactions/getting-started/q/platform/js#interactions-with-aws) | [Amazon Lex](https://aws.amazon.com/lex/)                   | Create conversational bots powered by deep learning technologies.                                                      |
| [**PubSub**](https://docs.amplify.aws/lib/pubsub/getting-started/q/platform/js)                                   | [AWS IoT](https://aws.amazon.com/iot/)                      | Provides connectivity with cloud-based message-oriented middleware.                                                    |
| [**Internationalization**](https://docs.amplify.aws/lib/utilities/i18n/q/platform/js)                             | ---                                                         | A lightweight internationalization solution.                                                                           |
| [**Cache**](https://docs.amplify.aws/lib/utilities/cache/q/platform/js)                                           | ---                                                         | Provides a generic LRU cache for JavaScript developers to store data with priority and expiration settings.            |
| [**Predictions**](https://docs.amplify.aws/lib/predictions/getting-started/q/platform/js)                         | Various\*                                                   | Connect your app with machine learning services like NLP, computer vision, TTS, and more.                              |

- Predictions utilizes a range of Amazon's Machine Learning services, including: Amazon Comprehend, Amazon Polly, Amazon Rekognition, Amazon Textract, and Amazon Translate.

## Getting Started

AWS Amplify is available as `aws-amplify` on [npm](https://www.npmjs.com/package/aws-amplify).

To get started pick your platform from our [**Getting Started** home page](https://docs.amplify.aws/start/?sc_icampaign=start&sc_ichannel=docs-home)

## Notice:

### Amplify 5.x.x has breaking changes. Please see the breaking changes below:

- If you are using **default exports** from any Amplify package, then you will need to migrate to using named exports. For example:

  ```diff
  - import Amplify from 'aws-amplify';
  + import { Amplify } from 'aws-amplify'

  - import Analytics from '@aws-amplify/analytics';
  + import { Analytics } from '@aws-amplify/analytics';
  // or better
  + import { Analytics } from 'aws-amplify';

  - import Storage from '@aws-amplify/storage';
  + import { Storage } from '@aws-amplify/storage';
  // or better
  + import { Storage } from 'aws-amplify';
  ```

- Datastore predicate syntax has changed, impacting the `DataStore.query`, `DataStore.save`, `DataStore.delete`, and `DataStore.observe` interfaces. For example:

  ```diff
  - await DataStore.delete(Post, (post) => post.status('eq', PostStatus.INACTIVE));
  + await DataStore.delete(Post, (post) => post.status.eq(PostStatus.INACTIVE));

  - await DataStore.query(Post, p => p.and( p => [p.title('eq', 'Amplify Getting Started Guide'), p.score('gt', 8)]));
  + await DataStore.query(Post, p => p.and( p => [p.title.eq('Amplify Getting Started Guide'), p.score.gt(8)]));
  ```

  - To use the new syntax with 5.x.x you may need to rebuild your Datastore models with the latest version of Amplify codegen. To do this:
    - [Upgrade the Amplify CLI](https://docs.amplify.aws/cli/start/workflows/#upgrade-amplify-cli)
      - `npm install -g @aws-amplify/cli`
    - [Re-generate your models with Amplify codegen](https://docs.amplify.aws/lib/datastore/getting-started/q/platform/js/#code-generation-amplify-cli)
      - `amplify codegen models`

- `Storage.list` has changed the name of the `maxKeys` parameter to `pageSize` and has a new return type that contains the results list. For example:

  ```diff
  - const photos = await Storage.list('photos/', { maxKeys: 100 });
  - const { key } = photos[0];

  + const photos = await Storage.list('photos/', { pageSize: 100 });
  + const { key } = photos.results[0];
  ```

- `Storage.put` with resumable turned on has changed the key to no longer include the bucket name. For example:

  ```diff
  - let uploadedObjectKey;
  - Storage.put(file.name, file, {
  -   resumable: true,
  -   // Necessary to parse the bucket name out to work with the key
  -   completeCallback: (obj) => uploadedObjectKey = obj.key.substring( obj.key.indexOf("/") + 1 )
  - }

  + let uploadedObjectKey;
  + Storage.put(file.name, file, {
  +   resumable: true,
  +   completeCallback: (obj) => uploadedObjectKey = obj.key
  + }
  ```

- `Analytics.record` no longer supports passing a string only inputs. For example:

  ```diff
  - Analytics.record('my example event');
  + Analytics.record( { name: 'my example event' });
  ```

- The `JS` export has been removed from `@aws-amplify/core` in favor the exporting the functions it contained.
- Any calls to `Amplify.Auth`, `Amplify.Cache`, and `Amplify.ServiceWorker` are no longer supported, instead your code should use the named exports. For example:

  ```diff
  - import { Amplify } from 'aws-amplify';
  - Amplify.configure(...);
  - // ...
  - Amplify.Auth.signIn(...);

  + import { Amplify, Auth } from 'aws-amplify';
  + Amplify.configure(...);
  + // ...
  + Auth.signIn(...);
  ```

### Amplify 4.x.x has breaking changes for React Native. Please see the breaking changes below:

- If you are using React Native (vanilla or Expo), you will need to add the following React Native community dependencies:
  - `@react-native-community/netinfo`
  - `@react-native-async-storage/async-storage`

```
// React Native
yarn add aws-amplify amazon-cognito-identity-js @react-native-community/netinfo @react-native-async-storage/async-storage
npx pod-install

// Expo
yarn add aws-amplify @react-native-community/netinfo @react-native-async-storage/async-storage
```

### Amplify 3.x.x has breaking changes. Please see the breaking changes below:

- `AWS.credentials` and `AWS.config` don’t exist anymore in Amplify JavaScript.
  - Both options will not be available to use in version 3. You will not be able to use and set your own credentials.
  - For more information on this change, please see the [AWS SDK for JavaScript v3](https://github.com/aws/aws-sdk-js-v3/#configuration)
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

### DataStore Docs

For more information on contributing to DataStore / how DataStore works, see the [DataStore Docs](packages/datastore/README.md)
