/*
 * Copyright 2017-2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with
 * the License. A copy of the License is located at
 *
 *     http://aws.amazon.com/apache2.0/
 *
 * or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
 * CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions
 * and limitations under the License.
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
import android.os.Handler;
import android.os.Looper;
import android.support.v4.app.NotificationCompat;
import android.support.v4.content.LocalBroadcastManager;
import android.util.Log;

import java.util.Map;
import java.util.List;
import java.security.SecureRandom;

import org.json.JSONObject;
import org.json.JSONException;

import com.google.firebase.messaging.FirebaseMessagingService;
import com.google.firebase.messaging.RemoteMessage;

import com.facebook.react.ReactApplication;
import com.facebook.react.ReactInstanceManager;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;

import com.amazonaws.amplify.pushnotification.modules.RNPushNotificationJsDelivery;
import com.amazonaws.amplify.pushnotification.modules.RNPushNotificationHelper;
import com.amazonaws.amplify.pushnotification.modules.RNPushNotificationCommon;


public class RNPushNotificationMessagingService extends FirebaseMessagingService {
    private static final String LOG_TAG = "RNPushNotificationMessagingService";

    /**
     * Called when message is received.
     *
     * @param remoteMessage Object representing the message received from Firebase Cloud Messaging.
     */
    @Override
    public void onMessageReceived(RemoteMessage remoteMessage) {
        Log.i(LOG_TAG, "Message From: " + remoteMessage.getFrom());

        final Boolean isForeground = isApplicationInForeground();
        final Bundle bundle = convertMessageToBundle(remoteMessage);
        final Boolean hasData = remoteMessage.getData().size() > 0 ? true: false;
        // We need to run this on the main thread, as the React code assumes that is true.
        // Namely, DevServerHelper constructs a Handler() without a Looper, which triggers:
        // "Can't create handler inside thread that has not called Looper.prepare()"
        Handler handler = new Handler(Looper.getMainLooper());
        handler.post(new Runnable() {
            public void run() {
                // Construct and load our normal React JS code bundle
                ReactInstanceManager mReactInstanceManager = ((ReactApplication) getApplication()).getReactNativeHost().getReactInstanceManager();
                ReactContext context = mReactInstanceManager.getCurrentReactContext();
                // If it's constructed, send a notification
                if (context != null) {
                    handleFCMMessagePush((ReactApplicationContext) context, bundle, isForeground, hasData);
                } else {
                    // Otherwise wait for construction, then send the notification
                    mReactInstanceManager.addReactInstanceEventListener(new ReactInstanceManager.ReactInstanceEventListener() {
                        public void onReactContextInitialized(ReactContext context) {
                            handleFCMMessagePush((ReactApplicationContext) context, bundle, isForeground, hasData);
                        }
                    });
                    if (!mReactInstanceManager.hasStartedCreatingInitialContext()) {
                        // Construct it in the background
                        mReactInstanceManager.createReactContextInBackground();
                    }
                }
            }
        });
    }

    private void handleFCMMessagePush(ReactApplicationContext context, Bundle bundle, Boolean isForeground, Boolean hasData) {
        // send the message to device emitter
        RNPushNotificationJsDelivery jsDelivery = new RNPushNotificationJsDelivery((ReactApplicationContext) context);
        bundle.putBoolean("foreground", isForeground);
        jsDelivery.emitNotificationReceived(bundle);

         // Check if message contains a data payload.
        if (hasData) {
            sendNotification((ReactApplicationContext) context, bundle.getBundle("data"), isForeground);
        }
    }

    // send out the notification bubble
    private void sendNotification(ReactApplicationContext context, Bundle bundle, Boolean isForeground) {
        // If notification ID is not provided by the user for push notification, generate one at random
        if (bundle.getString("id") == null) {
            SecureRandom randomNumberGenerator = new SecureRandom();
            randomNumberGenerator.setSeed(System.currentTimeMillis());
            bundle.putString("id", String.valueOf(randomNumberGenerator.nextInt()));
        }

        bundle.putBoolean("userInteraction", false);

        Log.i(LOG_TAG, "sendNotification: " + bundle);

        if (!isForeground) {
            Application applicationContext = (Application) context.getApplicationContext();
            RNPushNotificationHelper pushNotificationHelper = new RNPushNotificationHelper(applicationContext);
            pushNotificationHelper.sendToNotificationCentre(bundle);
        }

    }

    // whether the app is in foreground
    private boolean isApplicationInForeground() {
        ActivityManager activityManager = (ActivityManager) this.getSystemService(ACTIVITY_SERVICE);
        List<RunningAppProcessInfo> processInfos = activityManager.getRunningAppProcesses();
        if (processInfos != null) {
            for (RunningAppProcessInfo processInfo : processInfos) {
                if (processInfo.processName.equals(getApplication().getPackageName())
                    && processInfo.importance == RunningAppProcessInfo.IMPORTANCE_FOREGROUND) {
                    for (String d : processInfo.pkgList) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    // convert message object to bundle
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

    // convert data map to bundle
    private Bundle convertDataToBundle(RemoteMessage message) {
        Map<String, String> data = message.getData();

        Bundle bundle = new Bundle();
        for (Map.Entry<String, String> entry : data.entrySet()) {
            bundle.putString(entry.getKey(), entry.getValue());
        }
        return bundle;
    }

	/**
	 * Called if InstanceID token is updated. This may occur if the security of
	 * the previous token had been compromised. Note that this is called when the InstanceID token
	 * is initially generated so this is where you would retrieve the token.
	 */
	@Override
	public void onNewToken(String refreshedToken) {
		// Get updated InstanceID token.
		Log.i(LOG_TAG, "Refreshed token: " + refreshedToken);

		final Bundle bundle = createBundleWithToken(refreshedToken);
		// We need to run this on the main thread, as the React code assumes that is true.
		// Namely, DevServerHelper constructs a Handler() without a Looper, which triggers:
		// "Can't create handler inside thread that has not called Looper.prepare()"
		Handler handler = new Handler(Looper.getMainLooper());
		handler.post(new Runnable() {
			public void run() {
				// Construct and load our normal React JS code bundle
				ReactInstanceManager mReactInstanceManager = ((ReactApplication) getApplication()).getReactNativeHost().getReactInstanceManager();
				ReactContext context = mReactInstanceManager.getCurrentReactContext();
				// If it's constructed, send a notification
				if (context != null) {
					sendRegistrationToken((ReactApplicationContext) context, bundle);
				} else {
					// Otherwise wait for construction, then send the notification
					mReactInstanceManager.addReactInstanceEventListener(new ReactInstanceManager.ReactInstanceEventListener() {
						public void onReactContextInitialized(ReactContext context) {
							sendRegistrationToken((ReactApplicationContext) context, bundle);
						}
					});
					if (!mReactInstanceManager.hasStartedCreatingInitialContext()) {
						// Construct it in the background
						mReactInstanceManager.createReactContextInBackground();
					}
				}
			}
		});
	}

	private void sendRegistrationToken(ReactApplicationContext context, Bundle bundle) {
		RNPushNotificationJsDelivery jsDelivery = new RNPushNotificationJsDelivery(context);
		jsDelivery.emitTokenReceived(bundle);
	}

	private Bundle createBundleWithToken(String token) {
		Bundle bundle = new Bundle();
		bundle.putString("refreshToken", token);
		return bundle;
	}

}
