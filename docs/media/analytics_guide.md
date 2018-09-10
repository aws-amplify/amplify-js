---
---

# Analytics

The Analytics category enables you to collect analytics data for your app. The Analytics category comes with built-in support for [Amazon Pinpoint](#using-amazon-pinpoint) and [Amazon Kinesis](#using-amazon-kinesis).

Ensure you have [installed and configured the Amplify CLI and library]({%if jekyll.environment == 'production'%}{{site.amplify.docs_baseurl}}{%endif%}/media/quick_start).
{: .callout .callout--info}

#### Automated Setup

Run the following command in your project's root folder:

```bash
$ amplify add analytics
```

The CLI will prompt configuration options for the Analytics category such as Amazon Pinpoint resource name and analytics event settings.

{The Analytics category utilizes the Authentication category behind the scenes to authorize your app to send analytics events.}
{: .callout .callout--info}

The `add` command automatically creates a backend configuration locally. To update your backend run:

```bash
$ amplify push
```

A configuration file called `aws-exports.js` will be copied to your configured source directory, for example `./src`. The CLI will also print the URL for Amazon Pinpoint console to track your app events.  

##### Configure Your App

Import and load the configuration file in your app. It's recommended you add the Amplify configuration step to your app's root entry point. For example `App.js` in React or `main.ts` in Angular.

```js
import Amplify, { Analytics } from 'aws-amplify';
import aws_exports from './aws-exports';

Amplify.configure(aws_exports);
```

#### Manual Setup

The manual setup enables you to use your existing Amazon Pinpoint resource in your app.

```js
import { Analytics } from 'aws-amplify';

Analytics.configure({
    // OPTIONAL - disable Analytics if true
    disabled: false,
    // OPTIONAL - Allow recording session events. Default is true.
    autoSessionRecord: true,

    AWSPinpoint: {
        // OPTIONAL -  Amazon Pinpoint App Client ID
        appId: 'XXXXXXXXXXabcdefghij1234567890ab',
        // OPTIONAL -  Amazon service region
        region: 'XX-XXXX-X',
        // OPTIONAL -  Customized endpoint
        endpointId: 'XXXXXXXXXXXX',
        // OPTIONAL - client context
        clientContext: {
            clientId: 'xxxxx',
            appTitle: 'xxxxx',
            appVersionName: 'xxxxx',
            appVersionCode: 'xxxxx',
            appPackageName: 'xxxxx',
            platform: 'xxxxx',
            platformVersion: 'xxxxx',
            model: 'xxxxx',
            make: 'xxxxx',
            locale: 'xxxxx'
        },

        // Buffer settings used for reporting analytics events.

        // OPTIONAL - The buffer size for events in number of items.
        bufferSize: 1000,

        // OPTIONAL - The interval in milliseconds to perform a buffer check and flush if necessary.
        flushInterval: 5000, // 5s 

        // OPTIONAL - The number of events to be deleted from the buffer when flushed.
        flushSize: 100,

        // OPTIONAL - The limit for failed recording retries.
        resendLimit: 5
    } 
});
```

User session data is automatically collected unless you disabled analytics. To see the results visit the [Amazon Pinpoint console](https://console.aws.amazon.com/pinpoint/home/).
{: .callout .callout--info}

### Working with the API 

#### Recording Custom Events

To record custom events call the `record` method:

```js
Analytics.record({ name: 'albumVisit' });
```

#### Record a Custom Event with Attributes

The `record` method lets you add additional attributes to an event. For example, to record *artist* information with an *albumVisit* event:

```js
Analytics.record({
    name: 'albumVisit', 
    attributes: { genre: '', artist: '' }
});
```

#### Record Engagement Metrics

Metrics data can also be added to an event:

```js
Analytics.record({
    name: 'albumVisit', 
    attributes: {}, 
    metrics: { minutesListened: 30 }
});
```

#### Disable Analytics

You can also completely disable or re-enable Analytics:
```js
// to disable Analytics
Analytics.disable();

// to enable Analytics
Analytics.enable();
```

#### Update User Attributes

An endpoint uniquely identifies your app within Pinpoint. In order to update your <a href="https://docs.aws.amazon.com/pinpoint/latest/apireference/rest-api-endpoints.html" target="_blank">endpoint</a> use the `updateEndpoint()` method:

```js
Analytics.updateEndpoint({
    // Customized userId
    UserId: 'XXXXXXXXXXXX',
    // User attributes
    Attributes: {
        interests: ['football', 'basketball', 'AWS']
        // ...
    },
    // Custom user attributes
    UserAttributes: {
        hobbies: ['piano', 'hiking']
        // ...
    }
})
```

<a href="https://docs.aws.amazon.com/pinpoint/latest/developerguide/audience-define-user.html" target="_blank">Learn more</a> about Amazon Pinpoint and Endpoints.

#### API Reference

For a complete API reference visit the [API Reference]({%if jekyll.environment == 'production'%}{{site.amplify.docs_baseurl}}{%endif%}/api/classes/analyticsclass.html)
{: .callout .callout--info}


## Using Amazon Kinesis

The Amazon Kinesis analytics provider allows you to send analytics data to an [Amazon Kinesis](https://aws.amazon.com/kinesis) stream for real-time processing.

### Installation and Configuration

Register the *AWSKinesisProvider* with the Analytics category: 

```js
import { Analytics, AWSKinesisProvider } from 'aws-amplify';
Analytics.addPluggable(new AWSKinesisProvider());

```

If you did not use the CLI, ensure you have <a href="https://docs.aws.amazon.com/streams/latest/dev/learning-kinesis-module-one-iam.html" target="_blank">setup IAM permissions</a> for `PutRecords`.

Example IAM policy for Amazon Kinesis:
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "kinesis:PutRecord",
                "kinesis:PutRecords"
            ],
            "Resource": "*"
        }
    ]
}
```

For more information visit [Amazon Kinesis Developer Documentation](https://docs.aws.amazon.com/streams/latest/dev/learning-kinesis-module-one-iam.html).

Configure Kinesis:

```js

// Configure the plugin after adding it to the Analytics module
Analytics.configure({
    AWSKinesis: {

        // OPTIONAL -  Amazon Kinesis service region
        region: 'XX-XXXX-X',
        
        // OPTIONAL - The buffer size for events in number of items.
        bufferSize: 1000,
        
        // OPTIONAL - The number of events to be deleted from the buffer when flushed.
        flushSize: 100,
        
        // OPTIONAL - The interval in milliseconds to perform a buffer check and flush if necessary.
        flushInterval: 5000, // 5s
        
        // OPTIONAL - The limit for failed recording retries.
        resendLimit: 5
    } 
});

```

### Working with the API

You can send a data to a Kinesis stream with the standard *record()* method:

```js
Analytics.record({
    data: { 
        // The data blob to put into the record
    },
    // OPTIONAL
    partitionKey: 'myPartitionKey', 
    streamName: 'myKinesisStream'
}, 'AWSKinesis');
```

## Using a Custom Plugin

You can create your custom pluggable for Analytics. This may be helpful if you want to integrate your app with a custom analytics backend.

To create a plugin implement the `AnalyticsProvider` interface:

```typescript
import { Analytics, AnalyticsProvider } from 'aws-amplify';

export default class MyAnalyticsProvider implements AnalyticsProvider {
    // category and provider name
    static category = 'Analytics';
    static providerName = 'MyAnalytics';

    // you need to implement these four methods
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

You can now register your pluggable:

```js
// add the plugin
Analytics.addPluggable(new MyAnalyticsProvider());

// get the plugin
Analytics.getPluggable(MyAnalyticsProvider.providerName);

// remove the plulgin
Analytics.removePluggable(MyAnalyticsProvider.providerName);

// send configuration into Amplify
Analytics.configure({
    MyAnalyticsProvider: { 
        // My Analytics provider configuration 
    }
});

```

The default provider (Amazon Pinpoint) is in use when you call `Analytics.record()` unelss you specify a different provider: `Analytics.record({..},'MyAnalyticsProvider')`. 
{: .callout .callout--info}

## Using Modular Imports

You can import only specific categories into your app if you are only using specific features, analytics for example: `npm install @aws-amplify/analytics` which will only install the Analytics category. For working with AWS services you will also need to install and configure `@aws-amplify/auth`.

Import only Analytics:

```js
import Analytics from '@aws-amplify/analytics';

Analytics.configure();

```
