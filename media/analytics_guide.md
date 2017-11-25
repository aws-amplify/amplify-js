# Analytics

AWS Amplify Analytics module helps you quickly collect analytics for user sessions, custom attributes or metrics.

* [Installation and Configuration](#installation-and-configuration)
  - [Manual Setup](#manual-setup)
  - [Automated Setup](#automated-setup)
* [Integration](#integration)
  - [1. Collect Session Data](#1-collect-session-data)
  - [2. Record Event](#2-record-event)
  - [3. Record Event with Attributes](#3-record-event-with-attributes)
  - [4. Record Event with Metrics](#4-record-event-with-metrics)

## Installation and Configuration

Please refer to this [Guide](install_n_config.md) for general setup. Here are Analytics specific setup.

### Manual Setup

```js
import Amplify from 'aws-amplify';

Amplify.configure(
    Auth: {
        identityPoolId: 'XX-XXXX-X:XXXXXXXX-XXXX-1234-abcd-1234567890ab', //REQUIRED - Amazon Cognito Identity Pool ID
        region: 'XX-XXXX-X', // REQUIRED - Amazon Cognito Region
        userPoolId: 'XX-XXXX-X_abcd1234', //OPTIONAL - Amazon Cognito User Pool ID
        userPoolWebClientId: 'XX-XXXX-X_abcd1234', //OPTIONAL - Amazon Cognito Web Client ID
    },
    Analytics: {
        appId: 'XXXXXXXXXXabcdefghij1234567890ab', //OPTIONAL -  Amazon Pinpoint App ID
        region: 'XX-XXXX-X', //OPTIONAL -  Amazon service region
    });

```

In the above configuration you are required to pass in an Amazon Cognito Identity Pool ID so that the library can retrieve base credentials for a user even in an UnAuthenticated state. If you pass in properties in the Analytics section for Amazon Pinpoint the library will automatically track some base metrics for you without any effort on your part. 

### Automated Setup

To creae a project fully functioning with the Analytics category.

<p align="center">
  <a target="_blank" href="https://console.aws.amazon.com/mobilehub/home#/starterkit/?config=https://github.com/aws/aws-amplify/blob/master/media/backend/import_mobilehub/analytics.zip">
    <span>
        <img height="100%" src="https://s3.amazonaws.com/deploytomh/button-deploy-aws-mh.png"/>
    </span>
  </a>
</p>

After configuration, user session metrics are automatically collected and send to Amazon Pinpoint. To see these metrics click [here](https://console.aws.amazon.com/pinpoint/home/) or in your Mobile Hub project click the **Engage** tab on the left of the screen.

![Session](mobile_hub_3.png)

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
