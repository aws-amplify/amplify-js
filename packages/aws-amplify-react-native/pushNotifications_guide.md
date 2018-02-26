# Push Notifications

AWS Amplify Push Notifications module helps you push notifications by using AWS Pinpoint Campaign.

* [Installation and Configuration](#installation-and-configuration)
    - [Setup for Android device](#setup-for-android-device)
    - [Setup for IOS device](#setup-for-ios-device)

## Installation and Configuration

### Setup for Android device

1. [Set up Android push notifications](https://docs.aws.amazon.com/pinpoint/latest/developerguide/mobile-push-android.html)

2. [Add your API key and Sender ID to AWS Pinpoint](https://docs.aws.amazon.com/pinpoint/latest/developerguide/getting-started-android-mobilehub.html)

3. Run ```create-react-native-app myapp```

4. ```cd myapp``` and run ```yarn run eject``` or ```npm run eject```

5. Install aws-amplify-react-native

6. Run ```react-native link aws-amplify-react-native```

7. Open ```android/build.gradle```
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

8. Open ```android/app/build.gradle``` and add ```apply plugin: 'com.google.gms.google-services'``` at the bottom of the file.

9. Open ```android/app/src/main/AndroidManifest.xml``` and add the following into ```application```
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

10. Following the [link](https://firebase.google.com/docs/cloud-messaging/android/client?authuser=0) to integrate this app with Google Firebase

### Setup for IOS device