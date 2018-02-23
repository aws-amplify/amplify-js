### Setup Up Android Push Ntofications

1. [Set up Android push notifications](https://docs.aws.amazon.com/pinpoint/latest/developerguide/mobile-push-android.html)

2. [Add your API key and Sender ID to AWS Pinpoint](https://docs.aws.amazon.com/pinpoint/latest/developerguide/getting-started-android-mobilehub.html)

### How to setup in your react-native app

1. run ```create-react-native-app myapp```

2. run ```npm run eject```

3. install aws-amplify-react-native

4. run ```react-native link aws-amplify-react-native```

5. open ```android/build.gradle```:

Add ```classpath 'com.google.gms:google-services:3.1.1'``` in the ```dependencies``` under ```buildscript```:
```gradle
dependencies {
        classpath 'com.android.tools.build:gradle:2.2.3'
        classpath 'com.google.gms:google-services:3.1.1'
        // NOTE: Do not place your application dependencies here; they belong
        // in the individual module build.gradle files
    }
```

Add the following code  into ```repositories``` under ```allprojects```
```gradle
maven {
        url 'https://maven.google.com'
    }
```

6. open ```android/app/build.gradle```:

Add ```apply plugin: 'com.google.gms.google-services'``` at the bottom of the file.

7. open ```android/app/src/main/AndroidManifest.xml```:

add into ```application```
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
    </application>
```

8. following the [link](https://firebase.google.com/docs/cloud-messaging/android/client?authuser=0) to integrate this app with Google Firebase

### Add code into your app


```
import { PushNotification } from 'aws-amplify-react-native';

PushNotification.configure(aws_exports);
PushNotification.onNotification((data) => {
  console.log('in app notification', data);
});
PushNotification.onRegister((data) => {
  console.log('in app registration', data);
});

```

Note: make sure you have run ```Amplify.configure()``` before