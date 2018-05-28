---
---

# Analytics

AWS Amplify Analytics module helps you to easily collect analytics data for you app. Analytics data includes user sessions and other custom events that you want to track in your app.

## Installation and Configuration

Please refer to [AWS Amplify Installation Guide]({%if jekyll.environment == 'production'%}{{site.amplify.baseurl}}{%endif%}/media/install_n_config) for general setup. Here is how you can enable Analytics category for your app.

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

### Manual Setup

Manual setup enables you to use your existing Amazon Pinpoint credentials in your app:

```js
import Amplify from 'aws-amplify';

Amplify.configure({
    Analytics: {
    // OPTIONAL -  Amazon Pinpoint App Client ID
        appId: 'XXXXXXXXXXabcdefghij1234567890ab',
    // OPTIONAL -  Amazon service region
        region: 'XX-XXXX-X',
    // OPTIONAL -  Customized endpoint
        endpointId: 'XXXXXXXXXXXX',
    // OPTIONAL - disable Analytics if true
        disabled: false,
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

## Working with the API

### Collect Session Data

Once configured, the Analytics module will start collecting user session data without any additional code. 

### Recording a Custom Tracking Event

To record a custom tracking event, call the `record` method:

```js
import { Analytics } from 'aws-amplify';

Analytics.record('albumVisit');
```

### Record a Custom Tracking Event with Attributes

The `record` method lets you add additional attributes to an event. For example, in order to record *artist* information with an *albumVisit* event:

```js
import { Analytics } from 'aws-amplify';

Analytics.record('albumVisit', { genre: '', artist: '' });
```

### Record Engagement Metrics

Metrics data can also be added to an event:

```js
import { Analytics } from 'aws-amplify';

Analytics.record('albumVisit', {}, { minutesListened: 30 });
```

### Disable/Enable Analytics

You can disable or enable Analytics module as follows:
```js
import { Analytics } from 'aws-amplify';

// to disable Analytics
Analytics.disable();

// to enable Analytics
Analytics.enable();
```

### Record Authentication Events

You can use following events to record Sign-ins, Sign-ups, and Authentication failures.

```js
import { Analytics } from 'aws-amplify';

// Sign-in event
Analytics.record('_userauth.sign_in');

// Sign-up event
Analytics.record('_userauth.sign_up');

// Authentication failure event
Analytics.record('_userauth.auth_fail');
```

### Update User Attributes

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

### API Reference

For the complete API documentation for Analytics module, visit our [API Reference]({%if jekyll.environment == 'production'%}{{site.amplify.baseurl}}{%endif%}/api/classes/analyticsclass.html)
{: .callout .callout--info}

## Customization

### Create a Custom Analytics Plugin
You can create your custom class and plug it to Analytics module, so that any Analytics event can also be handled by your custom methods. This may be helpful when you need to integrate your app with a custom analytics backend.  

In your class, just implement `AnalyticsProvider`:

```js
import { AnalyticsProvider } from 'aws-amplify';

export default class MyAnalyticsProvider implements AnalyticsProvider {
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

You can now add your own Analytics plugin now by using:
```js
// send configuration into Amplify
Amplify.configure({
    Analytics: { 
        // My Analytics provider configuration 
    }
});
// use the plugin
Amplify.addPluggable(new MyAnalyticsProvider());
```

Please note that the default provider (Amazon Pinpoint) for the extended category (Analytics) will be in use when you call `Analytics.record()`.
{: .callout .callout--info}
