/**
 * Copyright 2016 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package com.amazonaws.amplify.pushnotification;

import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.media.RingtoneManager;
import android.net.Uri;
import android.os.Bundle;
import android.support.v4.app.NotificationCompat;
import android.support.v4.content.LocalBroadcastManager;
import android.util.Log;
import android.widget.Toast;
import java.util.Map;

import com.amazonaws.mobileconnectors.pinpoint.targeting.notification.NotificationClient;
import com.firebase.jobdispatcher.Constraint;
import com.firebase.jobdispatcher.FirebaseJobDispatcher;
import com.firebase.jobdispatcher.GooglePlayDriver;
import com.firebase.jobdispatcher.Job;
import com.google.firebase.messaging.FirebaseMessagingService;
import com.google.firebase.messaging.RemoteMessage;

import com.facebook.react.ReactApplication;
import com.facebook.react.ReactInstanceManager;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;

public class MyFirebaseMessagingService extends FirebaseMessagingService {

    // Intent action used in local broadcast
    public static final String ACTION_SNS_NOTIFICATION = "sns-notification";
    // Intent keys
    public static final String INTENT_SNS_NOTIFICATION_FROM = "from";
    public static final String INTENT_SNS_NOTIFICATION_DATA = "data";

    private static final String TAG = "MyFirebaseMsgService";

    private void broadcast(final String from, final Map<String, String> data) {
        Bundle bundle = new Bundle();
        for (Map.Entry<String, String> entry : data.entrySet()) {
            bundle.putString(entry.getKey(), entry.getValue());
        }

        Intent intent = new Intent(ACTION_SNS_NOTIFICATION);
        intent.putExtra(INTENT_SNS_NOTIFICATION_FROM, from);
        intent.putExtra(INTENT_SNS_NOTIFICATION_DATA, bundle);
        LocalBroadcastManager.getInstance(this).sendBroadcast(intent);
    }
    /**
     * Called when message is received.
     *
     * @param remoteMessage Object representing the message received from Firebase Cloud Messaging.
     */
    // [START receive_message]
    @Override
    public void onMessageReceived(RemoteMessage remoteMessage) {
        // [START_EXCLUDE]
        // There are two types of messages data messages and notification messages. Data messages are handled
        // here in onMessageReceived whether the app is in the foreground or background. Data messages are the type
        // traditionally used with GCM. Notification messages are only received here in onMessageReceived when the app
        // is in the foreground. When the app is in the background an automatically generated notification is displayed.
        // When the user taps on the notification they are returned to the app. Messages containing both notification
        // and data payloads are treated as notification messages. The Firebase console always sends notification
        // messages. For more see: https://firebase.google.com/docs/cloud-messaging/concept-options
        // [END_EXCLUDE]

        // TODO(developer): Handle FCM messages here.
        // Not getting messages here? See why this may be: https://goo.gl/39bRNJ
        Log.e(TAG, "From: " + remoteMessage.getFrom());
        
        ReactInstanceManager mReactInstanceManager = ((ReactApplication) getApplication()).getReactNativeHost().getReactInstanceManager();
        ReactContext context = mReactInstanceManager.getCurrentReactContext();

        RNPinpointSNSJsDelivery jsDelivery = new RNPinpointSNSJsDelivery((ReactApplicationContext) context);
        Bundle bundle = convertMessageToBundle(remoteMessage);
        jsDelivery.emitNotificationReceived(bundle);

        final NotificationClient notificationClient = PinpointSNSModule.getPinpointManager().getNotificationClient();
       // final Map<String, String> data = remoteMessage.getData();
        NotificationClient.CampaignPushResult pushResult =
                notificationClient.handleFCMCampaignPush(remoteMessage.getFrom(), remoteMessage.getData());

        if (!NotificationClient.CampaignPushResult.NOT_HANDLED.equals(pushResult)) {
            // The push message was due to a Dartboard campaign.
            // If the app was in the background, a local notification was added in the notification center.
            // If the app was in the foreground, an event was recorded indicating the app was in the foreground,
            // for the demo, we will broadcast the notification to let the main activity display it in a dialog.
            if (NotificationClient.CampaignPushResult.APP_IN_FOREGROUND.equals(pushResult)) {
                // Create a message that will display the raw data of the campaign push in a dialog.
                //data.putString("message", String.format("Received Campaign Push:\n%s", data.toString()));

                broadcast(remoteMessage.getFrom(), remoteMessage.getData());
            }
            return;
        }
    }

    private Bundle convertMessageToBundle(RemoteMessage message) {
        Bundle bundle = new Bundle();
        bundle.putString("collapseKey", message.getCollapseKey());
        bundle.putBundle("data", convertDataToBundle(message));
        bundle.putString("sender", message.getFrom());
        bundle.putString("messageId", message.getMessageId());
        bundle.putString("messageType", message.getMessageType());
        bundle.putLong("sentTime", message.getSentTime());
        bundle.putString("destination", message.getTo());
        bundle.putInt("ttl", message.getTtl());
        return bundle;
    }
    
    private Bundle convertDataToBundle(RemoteMessage message) {
        Map<String, String> data = message.getData();

        Bundle bundle = new Bundle();
        for (Map.Entry<String, String> entry : data.entrySet()) {
            bundle.putString(entry.getKey(), entry.getValue());
        }

        return bundle;
    }

}
