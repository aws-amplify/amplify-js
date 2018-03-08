# Analytics

AWS Amplify Analytics module helps you quickly collect analytics for user sessions, custom attributes or metrics.

* [Installation and Configuration](#installation-and-configuration)
  - [Automated Setup](#automated-setup)
  - [Manual Setup](#manual-setup)
* [Integration](#integration)
  - [1. Collect Session Data](#1-collect-session-data)
  - [2. Record Event](#2-record-event)
  - [3. Record Event with Attributes](#3-record-event-with-attributes)
  - [4. Record Event with Metrics](#4-record-event-with-metrics)
* [Add your own plugin](#add-your-own-plugin)

## Installation and Configuration

Please refer to this [Guide](install_n_config.md) for general setup. Here are Analytics specific setup.

### Automated Setup

To create a project fully functioning with the Analytics category.

```
$ npm install -g awsmobile-cli
$ cd my-app
$ awsmobile init
$ awsmobile enable analytics
$ awsmobile push
```

In your project i.e. App.js:

```
import Amplify, { Analytics } from 'aws-amplify';
import aws_exports from './aws-exports';
Amplify.configure(aws_exports);
```

### Manual Setup

```js
import Amplify from 'aws-amplify';

Amplify.configure(
    Analytics: {
    // OPTIONAL -  Amazon Pinpoint App ID
        appId: 'XXXXXXXXXXabcdefghij1234567890ab',
    // OPTIONAL -  Amazon service region
        region: 'XX-XXXX-X',
    } 
);

```

In the above configuration you are required to pass in an Amazon Cognito Identity Pool ID so that the library can retrieve base credentials for a user even in an UnAuthenticated state. If you pass in properties in the Analytics section for Amazon Pinpoint the library will automatically track some base metrics for you without any effort on your part. 

After configuration, user session metrics are automatically collected and sent to Amazon Pinpoint. To see these metrics click [here](https://console.aws.amazon.com/pinpoint/home/), or on the cli (from your project directory):

```
$ awsmobile console
```

Then click **Analytics**.

## Integration

### 1. Collect Session Data

Without any additional code, the Analytics module starts collect session data. All you need to do is to configure Analytics module.

### 2. Record Event

To record an event, call the `record` method:

```js
import { Analytics } from 'aws-amplify';

Analytics.record('albumVisit');
```

### 3. Record Event with Attributes

The `record` method lets you add additional attributes to an event. For example:

```js
import { Analytics } from 'aws-amplify';

Analytics.record('albumVisit', { genre: '', artist: '' });
```

### 4. Record Event with Metrics

Metrics can also be added to an event:

```js
import { Analytics } from 'aws-amplify';

Analytics.record('albumVisit', {}, { minutesListened: 30 });
```

## Add your own plugin
You can write your own plugin by using the interface ```AnalyticsProvider```:
```js
import { AnalyticsProvider } from 'aws-amplify';

export default class MyAnalyticsProvider implements AnalyticsProvider {
    // you need to implement those four methods
    // configure your provider
    configure(config: object): object;

    // record events and returns true if succeeds
    record(params: object): Promise<boolean>;

    // return 'Analytics';
    getCategory(): string;

    // return the name of you provider
    getProviderName(): string;
}
```

You can now add your own Analytics plugin now by using:
```js
// send configuration into Amplify
Amplify.configure({Analytics: { my_analytics_provider_configuration }});
// use the plugin
Amplify.addPluggable(new MyAnalyticsProvider());
```
