# Push Notifications

AWS Amplify Push Notifications module allows you to utilize push notifications and supports Amazon Pinpoint campaigns and targeting.

This guide shows an example of sending notifications using Amazon Pinpoint. This service can monitor your app usage, send campaigns to a segment of users based on attributes and demographics, and collect metrics based on push notification interaction using custom events. In order to use Amazon Pinpoint it is required to setup credentials (keys or certificates) for the platform of choice (Android and/or iOS).

The instructions are split for [Android](android) and [iOS](ios) and can be used on the same React Nastive project. Testing Push Notifications requires a real device (does not work on a simulator/emulator).

* [Installation and Configuration](#installation-and-configuration)
    - [Setup for Android device](#setup-for-android-device)
    - [Setup for IOS device](#setup-for-ios-device)
* [React Native Integration](#integration)

## Installation and Configuration

### Setup for Android device

1. [Set up Android push notifications](https://docs.aws.amazon.com/pinpoint/latest/developerguide/mobile-push-android.html)

2. [Add your API key and Sender ID to AWS Pinpoint](https://docs.aws.amazon.com/pinpoint/latest/developerguide/getting-started-android-mobilehub.html)

3. Create and link a React Native app:

```js
$ react-native init myapp
$ cd myapp
$ npm install aws-amplify --save
$ npm install aws-amplify-react-native --save
$ react-native link aws-amplify-react-native
```

4. Open ```android/build.gradle```
    - Add ```classpath 'com.google.gms:google-services:3.1.1'``` in the ```dependencies``` under ```buildscript```:
        ```gradle
        dependencies {
                classpath 'com.android.tools.build:gradle:2.2.3'
                classpath 'com.google.gms:google-services:3.1.1'
                // NOTE: Do not place your application dependencies here; they belong
                // in the individual module build.gradle files
            }
        ```

    - Add the following code  into ```repositories``` under ```allprojects```
        ```gradle
        maven {
                url 'https://maven.google.com'
            }
        ```

5. Open ```android/app/build.gradle``` and add ```apply plugin: 'com.google.gms.google-services'``` to the bottom of the file.

6. Open ```android/app/src/main/AndroidManifest.xml``` and add the following into ```application```
```xml
    <application ...>
    <!-- Add the following>
        <!-- [START firebase_service] -->
        <service
            android:name="com.amazonaws.amplify.pushnotification.RNPushNotificationMessagingService">
            <intent-filter>
                <action android:name="com.google.firebase.MESSAGING_EVENT"/>
            </intent-filter>
        </service>
        <!-- [END firebase_service] -->
        <!-- [START firebase_iid_service] -->
        <service
            android:name="com.amazonaws.amplify.pushnotification.RNPushNotificationDeviceIDService">
            <intent-filter>
                <action android:name="com.google.firebase.INSTANCE_ID_EVENT"/>
            </intent-filter>
        </service>
        <receiver
            android:name="com.amazonaws.amplify.pushnotification.RNPushNotificationBroadcastReceiver"
            android:exported="false" >
            <intent-filter>
                <action android:name="com.amazonaws.amplify.pushnotification.NOTIFICATION_OPENED"/>
            </intent-filter>
        </receiver>
    </application>
```

7. Follow this [link](https://firebase.google.com/docs/cloud-messaging/android/client?authuser=0) to setup your app with Google Firebase for Push Notifications on Android.

8. Run your app with ```yarn/npm run android``` or appropriate run command.

### Setup for IOS device

1. [Setup iOS Push Notifications and create a p12 certificate](https://docs.aws.amazon.com/pinpoint/latest/developerguide/apns-setup.html)
 
2. [Add p12 certificate to Amazon Pinpoint](https://docs.aws.amazon.com/pinpoint/latest/developerguide/getting-started-ios-mobilehub.html)

3. Create and link a React Native app:

```js
$ react-native init myapp
$ cd myapp
$ npm install aws-amplify --save
$ npm install aws-amplify-react-native --save
$ react-native link aws-amplify-react-native
```

4. open ```ios/myapp.xcodeproj```:

5. [Manually link the PushNotificationIOS library](https://facebook.github.io/react-native/docs/linking-libraries-ios.html#manual-linking)

6. Add the following code at the top on the file ```AppDelegate.m```
```c
#import <React/RCTPushNotificationManager.h>
```

7. And then in your ```AppDelegate``` implementation file add the following:
```c
// Required to register for notifications
 - (void)application:(UIApplication *)application didRegisterUserNotificationSettings:(UIUserNotificationSettings *)notificationSettings
 {
  [RCTPushNotificationManager didRegisterUserNotificationSettings:notificationSettings];
 }
 // Required for the register event.
 - (void)application:(UIApplication *)application didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken
 {
  [RCTPushNotificationManager didRegisterForRemoteNotificationsWithDeviceToken:deviceToken];
 }
 // Required for the notification event. You must call the completion handler after handling the remote notification.
 - (void)application:(UIApplication *)application didReceiveRemoteNotification:(NSDictionary *)userInfo
                                                        fetchCompletionHandler:(void (^)(UIBackgroundFetchResult))completionHandler
 {
   [RCTPushNotificationManager didReceiveRemoteNotification:userInfo fetchCompletionHandler:completionHandler];
 }
 // Required for the registrationError event.
 - (void)application:(UIApplication *)application didFailToRegisterForRemoteNotificationsWithError:(NSError *)error
 {
  [RCTPushNotificationManager didFailToRegisterForRemoteNotificationsWithError:error];
 }
 // Required for the localNotification event.
 - (void)application:(UIApplication *)application didReceiveLocalNotification:(UILocalNotification *)notification
 {
  [RCTPushNotificationManager didReceiveLocalNotification:notification];
 }
 ```

8. Update General App settings
 - Make sure you have logged in with your Apple Developer account on Xcode
  - Set bundle identifier (with the one you create on your Apple Developer Account)
  - Unselect Automatically manage signing 
  - On Signing (Debug, Release) set the provisioning profile (created on your Apple Developer Account)
  ![alt text](./identifiers.gif "")

9. Setup capabilities on your App and enable Push Notifications and Background Modes. On Background Modes select Remote notifications.
 ![alt text](./capabilities.gif "")

10. Run your app
 - On Xcode select your device and run by first using as Executable appName.app and this install the App on your device but it won't run (is ok, trust me)
 - On Product>Schema>Edit Schema on Run>Info tab on Executable section select Ask on Launch.
 - Click run button and select your app from the list.
  - In case it fails to build, try clean the project shift + command + k
  ![alt text](./runningApp.gif "")

## Integration

First import the ```PushNotification``` module and configure it. Make sure that you have configured the ```Analytics``` module before.

```js
import { PushNotificationIOS } from 'react-native';
import Amplify from 'aws-amplify';
import { PushNotification } from 'aws-amplify-react-native';

// PushNotification need to work with Analytics
Amplify.configure({
    Analytics: {
        // ...
    }
});

PushNotification.configure({
    // ...
    PushNotification: {
        appId: 'XXXXXXXXXXabcdefghij1234567890ab',
    }
    // ...
});
```

Retrieve the registration token and notification data by using:

```js
// get the notification data
PushNotification.onNotification((notification) => {
  // Note that the notification object structure is different from Android and IOS
  console.log('in app notification', notification);

  // required on iOS only (see fetchCompletionHandler docs: https://facebook.github.io/react-native/docs/pushnotificationios.html)
  notification.finish(PushNotificationIOS.FetchResult.NoData);
});

// get the registration token
PushNotification.onRegister((token) => {
  console.log('in app registration', token);
});
```

