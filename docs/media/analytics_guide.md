---
---

# Analytics

AWS Amplify Analytics module helps you to easily collect analytics data for you app. Analytics data includes user sessions and other custom events that you want to track in your app.


## Installation and Configuration

Please refer to [AWS Amplify Installation Guide](/media/install_n_config/index.html) for general setup. Here is how you can enable Analytics category for your app.

### Automated Setup

Automated Setup works with `awsmobile-cli` to create your analytics backend. After configuring your backend, you can create a project with fully functioning Analytics category.

```bash
$ npm install -g awsmobile-cli
```

You should run all `awsmobile` commands at *root folder* of your project.
{: .callout .callout--info}

In your project's *root folder*, run following command to configure and update your backend:

```bash
$ cd my-app #Change to your project's root folder
$ awsmobile init
$ awsmobile enable analytics
$ awsmobile push
```

In your app's entry point i.e. App.js, import and load the configuration.

```js
import Amplify, { Analytics } from 'aws-amplify';
import aws_exports from './aws-exports';

Amplify.configure(aws_exports);
```

### Manual Setup

Manual setup enables you to use your existing Amazon Pinpoint credentials in your app:

```js
import Amplify from 'aws-amplify';

Amplify.configure(
    Analytics: {
    // OPTIONAL -  Amazon Pinpoint App Client ID
        appId: 'XXXXXXXXXXabcdefghij1234567890ab',
    // OPTIONAL -  Amazon service region
        region: 'XX-XXXX-X',
    } 
);

```

In the above configuration you are required to pass in an *Amazon Pinpoint App Client ID* so that the library can retrieve base credentials for a user even in an un-authenticated state. After successfully configuring your credentials, the library will automatically track some default metrics for you, without any effort on your part. 

User session analytics data is automatically collected and sent to Amazon Pinpoint. To see these data, please visit [Amazon Pinpoint console](https://console.aws.amazon.com/pinpoint/home/), or run following cli command to launch AWS Mobile Hub console:

```
$ awsmobile console
```

On the AWS Mobile Hub console, click **Messaging and Analytics** option under 'Backend' section.

## Integration

### 1. Collect Session Data

Once configured, the Analytics module will start collecting user session data without any additional code. 

### 2. Recording a Custom Tracking Event

To record a custom tracking event, call the `record` method:

```js
import { Analytics } from 'aws-amplify';

Analytics.record('albumVisit');
```

### 3. Record Custom Tracking Event with Attributes

The `record` method lets you add additional attributes to an event. For example, in order to record *artist* information with an *albumVisit* event:

```js
import { Analytics } from 'aws-amplify';

Analytics.record('albumVisit', { genre: '', artist: '' });
```

### 4. Record Engagement Metrics

Metrics data can also be added to an event:

```js
import { Analytics } from 'aws-amplify';

Analytics.record('albumVisit', {}, { minutesListened: 30 });
```


For the complete API documentation for Analytics module, visit our [API Reference](/api/classes/analyticsclass.html)
{: .callout .callout--info}