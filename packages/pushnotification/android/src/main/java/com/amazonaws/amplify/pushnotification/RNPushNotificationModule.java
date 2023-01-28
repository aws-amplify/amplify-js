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

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.util.Log;

import com.amazonaws.amplify.pushnotification.modules.RNPushNotificationJsDelivery;
import com.facebook.react.bridge.ActivityEventListener;
import com.facebook.react.bridge.LifecycleEventListener;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Callback;

import com.google.android.gms.tasks.OnCompleteListener;
import com.google.android.gms.tasks.Task;
import com.google.firebase.messaging.FirebaseMessaging;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

public class RNPushNotificationModule extends ReactContextBaseJavaModule implements ActivityEventListener, LifecycleEventListener {
    private static final String LOG_TAG = "RNPushNotificationModule";
    private boolean isInitialAppOpen = true;

    public RNPushNotificationModule(ReactApplicationContext reactContext) {
        super(reactContext);

        Log.i(LOG_TAG, "constructing RNPushNotificationModule");
        reactContext.addActivityEventListener(this);
        reactContext.addLifecycleEventListener(this);
    }

    @NonNull
    @Override
    public String getName() {
        return "RNPushNotification";
    }

    @ReactMethod
    public void getToken(final Callback onSuccessCallback, final Callback onErrorCallback) {
        FirebaseMessaging.getInstance().getToken().addOnCompleteListener(new OnCompleteListener<String>() {
            @Override
            public void onComplete(@NonNull Task<String> task) {
                if (task.isSuccessful()) {
                    String token = task.getResult();
                    Log.i(LOG_TAG, "got token " + token);
                    onSuccessCallback.invoke(token);
                } else {
                    Exception exception = task.getException();
                    if (exception != null) {
                        String exceptionMessage = exception.getMessage();
                        Log.e(LOG_TAG, "Error getting token: " + exceptionMessage);
                        onErrorCallback.invoke(exceptionMessage);
                    }
                }
            }
        });
    }

    @Override
    public void onActivityResult(Activity activity, int requestCode, int resultCode, @Nullable Intent data) {
        // noop - only overridden as this class implements ActivityEventListener
    }

    @Override
    public void onNewIntent(Intent intent) {
        emitNotificationOpenedEvent(intent);
    }

    @Override
    public void onHostResume() {
        if (isInitialAppOpen) {
            isInitialAppOpen = false;
            if (getCurrentActivity() != null) {
                Intent intent = getCurrentActivity().getIntent();
                emitNotificationOpenedEvent(intent);
            }
        }
    }

    @Override
    public void onHostPause() {
        // noop - only overridden as this class implements LifecycleEventListener
    }

    @Override
    public void onHostDestroy() {
        // noop - only overridden as this class implements LifecycleEventListener
    }

    private void emitNotificationOpenedEvent(Intent intent) {
        final Bundle notificationExtra = intent.getBundleExtra("notification");
        if (notificationExtra != null) {
            RNPushNotificationJsDelivery jsDelivery = new RNPushNotificationJsDelivery(getReactApplicationContext());
            jsDelivery.emitNotificationOpened(notificationExtra);
        }
    }
}
