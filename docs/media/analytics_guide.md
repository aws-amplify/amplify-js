---
---

# Analytics

AWS Amplify Analytics module helps you to easily collect analytics data for you app. For now Analytics is available with AWS Pinpoint and AWS Kinesis providers.

## AWS Pinpoint provider

AWS Pinpoint enables you to send Analytics data includes user sessions and other custom events that you want to track in your app.

### Installation and Configuration

Please refer to [AWS Amplify Installation Guide]({%if jekyll.environment == 'production'%}{{site.amplify.baseurl}}{%endif%}/media/install_n_config) for general setup. Here is how you can enable Analytics category for your app.

#### Automated Setup

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
$ awsmobile push #Update your backend 
```

*awsmobile init* will enable Analytics module by default for your backend. In case you want to enable/disable it manually, you can use:

```bash
$ awsmobile analytics enable 
```

In your app's entry point i.e. App.js, import and load the configuration file which has been created and replaced into `/src` folder in the previous step.

```js
import Amplify, { Analytics } from 'aws-amplify';
import aws_exports from './aws-exports';

Amplify.configure(aws_exports);
```

#### Manual Setup

Manual setup enables you to use your existing Amazon Pinpoint resources in your app:

```js
import { Analytics } from 'aws-amplify';

<<<<<<< HEAD
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

        // OPTIONAL - The interval in milisecons to perform a buffer check and flush if necessary.
        flushInterval: 5000, // 5s 

        // OPTIONAL - The number of events to be deleted from the buffer when flushed.
        flushSize: 100,

        // OPTIONAL - The limit for failed recording retries.
        resendLimit: 5
        }
    } 
});
```

In the above configuration you are required to pass in an *Amazon Pinpoint App Client ID* so that the library can retrieve base credentials for a user even in an un-authenticated state. After successfully configuring your credentials, the library will automatically track some default metrics for you, without any effort on your part. 

User session analytics data is automatically collected and sent to Amazon Pinpoint. To see these data, please visit [Amazon Pinpoint console](https://console.aws.amazon.com/pinpoint/home/), or run following cli command to launch AWS Mobile Hub console:

```
$ awsmobile console
```

On the AWS Mobile Hub console, click **Messaging and Analytics** option under 'Backend' section.

### Working with the API

#### Collect Session Data

Once configured, the Analytics module will start collecting user session data without any additional code. 

#### Recording a Custom Tracking Event

To record a custom tracking event, call the `record` method:

```js
import { Analytics } from 'aws-amplify';

Analytics.record({ name: 'albumVisit' });
```

#### Record a Custom Tracking Event with Attributes

The `record` method lets you add additional attributes to an event. For example, in order to record *artist* information with an *albumVisit* event:

```js
import { Analytics } from 'aws-amplify';

Analytics.record({
    name: 'albumVisit', 
    attributes: { genre: '', artist: '' }
});
```

#### Record Engagement Metrics

Metrics data can also be added to an event:

```js
import { Analytics } from 'aws-amplify';

Analytics.record({
    name: 'albumVisit', 
    attributes: {}, 
    metrics: { minutesListened: 30 }
});
```

#### Disable/Enable Analytics

You can disable or enable Analytics module as follows:
```js
import { Analytics } from 'aws-amplify';

// to disable Analytics
Analytics.disable();

// to enable Analytics
Analytics.enable();
```

#### Record Authentication Events

You can use following events to record Sign-ins, Sign-ups, and Authentication failures.

```js
import { Analytics } from 'aws-amplify';

// Sign-in event
Analytics.record({
    name: '_userauth.sign_in'
});

// Sign-up event
Analytics.record({
    name: '_userauth.sign_up'
});

// Authentication failure event
Analytics.record({
    name: '_userauth.auth_fail'
});
```

#### Update User Attributes

In order to update User Attributes, use `updateEndpoint()` method as following:

```js
import { Analytics } from 'aws-amplify';

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

#### API Reference

For the complete API documentation for Analytics module, visit our [API Reference]({%if jekyll.environment == 'production'%}{{site.amplify.baseurl}}{%endif%}/api/classes/analyticsclass.html)
{: .callout .callout--info}


## AWS Kinesis provider

AWS Kinesis enables you to send Analytics data like click events into specific stream and process in real time.

### Installation and Configuration

Please make sure you have your IAM role with the proper policy to put records into your Kinesis stream.
Example policy:
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

#### Manual Setup

You need to add `AWSKinesisProvider` into `Analytics` Category with the configuration:
```js
import { Analytics, AWSKinesisProvider } from 'aws-amplify';

Analytics.addPluggable(new AWSKinesisProvider({
    // OPTIONAL -  Amazon service region
        region: 'XX-XXXX-X',
    // OPTIONAL - the size of the buffer which is used to store events
        bufferSize: 1000
    // OPTIONAL - the number of the events per flush
        flushSize: 100
    // OPTIONAL - the interval between per flush
        flushInterval: 5000 // 5s
    // OPTIONAL - the resend limits per event
        resendLimit: 5
    }));

// Or you can configure after adding it to the Analytics module
Analytics.configure({
    AWSKinesis: {
    // OPTIONAL -  Amazon service region
        region: 'XX-XXXX-X',
    // OPTIONAL - the size of the buffer which is used to store events
        bufferSize: 1000
    // OPTIONAL - the number of the events per flush
        flushSize: 100
    // OPTIONAL - the interval between per flush
        flushInterval: 5000 // 5s
    // OPTIONAL - the resend limits per event
        resendLimit: 5
    } 
});
```

### Working with the API

#### Put record

You can send a record with any data to a kinesis stream:
```js
Analytics.record({
    data: { // the data blob
    },
    partitionKey: 'myPartitionKey' // OPTIONAL
    streamName: 'myKinesisStream'
}, 'AWSKinesis');
```

## Customization

### Create a Custom Analytics Plugin
You can create your custom class and plug it to Analytics module, so that any Analytics event can also be handled by your custom methods. This may be helpful when you need to integrate your app with a custom analytics backend.  

In your class, just implement `AnalyticsProvider`:

```js
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

You can now register your own Analytics plugin as follows:
```js
// add the plugin
Analytics.addPluggable(new MyAnalyticsProvider());

// get the plugin
Analytics.getPluggable(MyAnalyticsProvider.providerName);

// remove the plulgin
Analytics.removePluggable(MyAnalyticsProvider.providerName);

// send configuration into Amplify
Analytics.configure({
    YOUR_PLUGIN_NAME: { 
        // My Analytics provider configuration 
    }
});

```

Please note that the default provider (Amazon Pinpoint) for the extended category (Analytics) will be in use when you call `Analytics.record()`.
{: .callout .callout--info}
