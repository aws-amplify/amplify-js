# Analytics

AWS Amplify Analytics module helps you quickly collect analytics for user sessions, custom attributes or metrics.

* [Installation](#installation)
* [Configuration](#configuration)
* [Integration](#integration)
  - [1. Collect Session Data](#1-collect-session-data)
  - [2. Record Event](#2-record-event)
  - [3. Record Event with Attributes](#3-record-event-with-attributes)
  - [4. Record Event with Metrics](#4-record-event-with-metrics)

## Installation

For Web development, regardless of framework, `aws-amplify` provides core Analytics APIs:

```
npm install aws-amplify
```

On React app, we have provided some helpful components in `aws-amplify-react`:

```
npm install aws-amplify-react
```

In React Native development, we package the core APIs and components into one `aws-amplify-react-native`:

```
npm install aws-amplify-react-native
```

## Configuration

```
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

### Manual Setup
[Amazon Cognito Identity](http://docs.aws.amazon.com/cognito/latest/developerguide/getting-started-with-identity-pools.html)

[Amazon Pinpoint](http://docs.aws.amazon.com/pinpoint/latest/developerguide/getting-started.html)

### Automated Setup

AWS Mobile Hub streamlines the steps above for you. Simply click the button:

<p align="center">
  <a target="_blank" href="https://console.aws.amazon.com/mobilehub/home?#/?config=https://github.com/aws/aws-amplify/blob/master/media/backend/import_mobilehub/analytics.zip">
    <span>
        <img height="100%" src="https://s3.amazonaws.com/deploytomh/button-deploy-aws-mh.png"/>
    </span>
  </a>
</p>

This will create a project that works with Analytics category fully functioning. After the project is created in the Mobile Hub console download the `aws-exports.js` configuration file by clicking the **Hosting and Streaming** tile then **Download aws-exports.js**.

![Mobile Hub](mobile_hub_1.png)

Download `aws-exports.js` to your project source directory.

![Download](mobile_hub_2.png)


Next, import the file and pass it as the configuration to the Amplify library:

```
import Amplify from 'aws-amplify';
import aws_exports from './aws-exports.js';

Amplify.configure(aws_exports);
```

After configuration, user session metrics are automatically collected and send to Amazon Pinpoint. To see these metrics click [here](https://console.aws.amazon.com/pinpoint/home/) or in your Mobile Hub project click the **Engage** tab on the left of the screen.

![Session](mobile_hub_3.png)

## Integration

### 1. Collect Session Data

Without any additional code, the Analytics module starts collect session data. All you need to do is to configure Analytics module. See [configuration](#configuration)

### 2. Record Event

To record an event, call the `record` method:

```
import { Analytics } from 'aws-amplify';

Analytics.record('albumVisit');
```

### 3. Record Event with Attributes

The `record` method lets you add additional attributes to an event. For example:

```
import { Analytics } from 'aws-amplify';

Analytics.record('albumVisit', { genre: '', artist: '' });
```

### 4. Record Event with Metrics

Metrics can also be added to an event:

```
import { Analytics } from 'aws-amplify';

Analytics.record('albumVisit', {}, { minutesListened: 30 });
```
