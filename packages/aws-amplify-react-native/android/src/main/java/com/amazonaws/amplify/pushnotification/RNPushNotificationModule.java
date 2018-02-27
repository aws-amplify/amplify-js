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

import android.util.Log;
import android.os.Bundle;

import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import com.facebook.react.ReactApplication;
import com.facebook.react.ReactInstanceManager;

import com.google.firebase.iid.FirebaseInstanceId;

import com.amazonaws.amplify.pushnotification.modules.RNPushNotificationJsDelivery;

public class RNPushNotificationModule extends ReactContextBaseJavaModule {
    private static final String LOG_TAG = "RNPushNotificationModule";

    public RNPushNotificationModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "RNPushNotification";
    }

    @ReactMethod
    public void initialize() {
        ReactApplicationContext context = getReactApplicationContext();
        Log.i(LOG_TAG, "initializing RNPushNotificationModule");

        // get the device token
        String refreshedToken = FirebaseInstanceId.getInstance().getToken();

        // send the token to device emitter
        // on register
        RNPushNotificationJsDelivery jsDelivery = new RNPushNotificationJsDelivery(context);
        Bundle bundle = new Bundle();
        bundle.putString("refreshToken", refreshedToken);
        jsDelivery.emitTokenReceived(bundle);
    }
}