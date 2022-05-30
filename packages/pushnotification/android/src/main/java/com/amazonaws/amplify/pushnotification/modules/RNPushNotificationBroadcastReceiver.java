/*
 * Copyright 2017-2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
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
package com.amazonaws.amplify.pushnotification.modules;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.util.Log;

import com.facebook.react.ReactApplication;
import com.facebook.react.ReactInstanceManager;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;

import org.json.JSONException;
import org.json.JSONObject;

/**
 * The Amazon Pinpoint push notification receiver.
 */
public class RNPushNotificationBroadcastReceiver extends BroadcastReceiver {

    private final static String LOG_TAG = "RNPushNotificationBroadcastReceiver";
    private final static String PINPOINT_DEEPLINK_PROPERTY = "pinpoint.deeplink";

    private Class getMainActivityClass(Context context) {
        String packageName = context.getPackageName();
        Intent launchIntent = context.getPackageManager().getLaunchIntentForPackage(packageName);
        String className = launchIntent.getComponent().getClassName();
        try {
            return Class.forName(className);
        } catch (ClassNotFoundException e) {
            e.printStackTrace();
            return null;
        }
    }

    private void openApp(Context context, Intent notificationIntent) {
        Class intentClass = getMainActivityClass(context);
        Intent launchIntent = new Intent(context, intentClass);
        if (launchIntent == null) {
            Log.e(LOG_TAG, "Couldn't get app launch intent for campaign notification.");
            return;
        }

        launchIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_RESET_TASK_IF_NEEDED);
        launchIntent.setPackage(null);

        Bundle notificationBundle = notificationIntent.getBundleExtra("notification");

        try {
            JSONObject json = RNPushNotificationCommon.convertJSONObject(notificationBundle);
            if (json.has(PINPOINT_DEEPLINK_PROPERTY)) {
                // Required to open "killed" app
                launchIntent.setAction(Intent.ACTION_VIEW);
                // Send deeplink to react-native's "Linking.getInitialURL()"
                launchIntent.setData(Uri.parse(json.getString(PINPOINT_DEEPLINK_PROPERTY)));
            }
        } catch (JSONException e) {
            // Do nothing
        }

        context.startActivity(launchIntent);
    }

    @Override
    public void onReceive(Context context,final Intent intent) {
        Log.i(LOG_TAG, "broadcaster received");

        // send the message to device emitter
        // Construct and load our normal React JS code bundle
        final ReactInstanceManager mReactInstanceManager = ((ReactApplication) context.getApplicationContext()).getReactNativeHost().getReactInstanceManager();
        ReactContext reactContext = mReactInstanceManager.getCurrentReactContext();
        if (reactContext != null) {
            emitNotificationOpenedEvent(reactContext, intent);
        } else {
            // If the ReactContext is null, add a listener to use it when it becomes initialized
            mReactInstanceManager.addReactInstanceEventListener(new ReactInstanceManager.ReactInstanceEventListener() {
                public void onReactContextInitialized(ReactContext currentReactContext) {
                    emitNotificationOpenedEvent(currentReactContext, intent);
                    mReactInstanceManager.removeReactInstanceEventListener(this);
                }
            });
            // Build the ReactContext in the background
            if (!mReactInstanceManager.hasStartedCreatingInitialContext()) {
                mReactInstanceManager.createReactContextInBackground();
            }
        }
        openApp(context, intent);
    }

    private void emitNotificationOpenedEvent(ReactContext reactContext, Intent intent){
            RNPushNotificationJsDelivery jsDelivery = new RNPushNotificationJsDelivery((ReactApplicationContext) reactContext);
            jsDelivery.emitNotificationOpened(intent.getBundleExtra("notification"));
    }
}
