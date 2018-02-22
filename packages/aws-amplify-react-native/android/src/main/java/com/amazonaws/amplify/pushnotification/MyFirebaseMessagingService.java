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


import android.app.ActivityManager;
import android.app.ActivityManager.RunningAppProcessInfo;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Application;
import android.content.Context;
import android.content.Intent;
import android.media.RingtoneManager;
import android.net.Uri;
import android.os.Bundle;
import android.support.v4.app.NotificationCompat;
import android.support.v4.content.LocalBroadcastManager;
import android.util.Log;

import java.util.Map;
import java.util.List;
import java.util.Random;


import org.json.JSONObject;
import org.json.JSONException;


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
        Log.e(TAG, "From: " + remoteMessage.getFrom());
        
        ReactInstanceManager mReactInstanceManager = ((ReactApplication) getApplication()).getReactNativeHost().getReactInstanceManager();
        ReactContext context = mReactInstanceManager.getCurrentReactContext();

        RNPinpointSNSJsDelivery jsDelivery = new RNPinpointSNSJsDelivery((ReactApplicationContext) context);
        Bundle bundle = convertMessageToBundle(remoteMessage);
        jsDelivery.emitNotificationReceived(bundle);

        // Check if message contains a data payload.
        if (remoteMessage.getData().size() > 0) {
            Log.e(TAG, "Message data payload: " + remoteMessage.getData());
            sendNotification((ReactApplicationContext) context, bundle);
        }

        return;
    //     final NotificationClient notificationClient = PinpointSNSModule.getPinpointManager().getNotificationClient();
    //    // final Map<String, String> data = remoteMessage.getData();
    //     NotificationClient.CampaignPushResult pushResult =
    //             notificationClient.handleFCMCampaignPush(remoteMessage.getFrom(), remoteMessage.getData());

    //     if (!NotificationClient.CampaignPushResult.NOT_HANDLED.equals(pushResult)) {
    //         // The push message was due to a Dartboard campaign.
    //         // If the app was in the background, a local notification was added in the notification center.
    //         // If the app was in the foreground, an event was recorded indicating the app was in the foreground,
    //         // for the demo, we will broadcast the notification to let the main activity display it in a dialog.
    //         if (NotificationClient.CampaignPushResult.APP_IN_FOREGROUND.equals(pushResult)) {
    //             // Create a message that will display the raw data of the campaign push in a dialog.
    //             //data.putString("message", String.format("Received Campaign Push:\n%s", data.toString()));

    //             broadcast(remoteMessage.getFrom(), remoteMessage.getData());
    //         }
    //         return;
    //     }
    }

    private void sendNotification(ReactApplicationContext context, Bundle bundle) {
        Boolean isForeground = isApplicationInForeground();
        try {
            JSONObject data = RNPushNotificationCommon.convertJSONObject(bundle);
            if (data != null) {
                if (!bundle.containsKey("message")) {
                    bundle.putString("message", data.optString("alert", "Notification received"));
                }
                if (!bundle.containsKey("title")) {
                    bundle.putString("title", data.optString("title", null));
                }
                if (!bundle.containsKey("sound")) {
                    bundle.putString("soundName", data.optString("sound", null));
                }
                if (!bundle.containsKey("color")) {
                    bundle.putString("color", data.optString("color", null));
                }
            }

            // If notification ID is not provided by the user for push notification, generate one at random
            if (bundle.getString("id") == null) {
                Random randomNumberGenerator = new Random(System.currentTimeMillis());
                bundle.putString("id", String.valueOf(randomNumberGenerator.nextInt()));
            }


            bundle.putBoolean("foreground", isForeground);
            bundle.putBoolean("userInteraction", false);

            Log.e(TAG, "sendNotification: " + bundle);

            if (!isForeground) {
                Application applicationContext = (Application) context.getApplicationContext();
                RNPushNotificationHelper pushNotificationHelper = new RNPushNotificationHelper(applicationContext);
                pushNotificationHelper.sendToNotificationCentre(bundle);
            }
        } catch (JSONException e) {
            return;
        }
    }

    private boolean isApplicationInForeground() {
        ActivityManager activityManager = (ActivityManager) this.getSystemService(ACTIVITY_SERVICE);
        List<RunningAppProcessInfo> processInfos = activityManager.getRunningAppProcesses();
        if (processInfos != null) {
            for (RunningAppProcessInfo processInfo : processInfos) {
                if (processInfo.processName.equals(getApplication().getPackageName())) {
                    if (processInfo.importance == RunningAppProcessInfo.IMPORTANCE_FOREGROUND) {
                        for (String d : processInfo.pkgList) {
                            return true;
                        }
                    }
                }
            }
        }
        return false;
    }

    

    private Bundle convertMessageToBundle(RemoteMessage message) {
        Bundle bundle = new Bundle();
        bundle.putString("collapseKey", message.getCollapseKey());
        bundle.putString("sender", message.getFrom());
        bundle.putString("messageId", message.getMessageId());
        bundle.putString("messageType", message.getMessageType());
        bundle.putLong("sentTime", message.getSentTime());
        bundle.putString("destination", message.getTo());
        bundle.putInt("ttl", message.getTtl());
        bundle.putBundle("data", convertDataToBundle(message));

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
