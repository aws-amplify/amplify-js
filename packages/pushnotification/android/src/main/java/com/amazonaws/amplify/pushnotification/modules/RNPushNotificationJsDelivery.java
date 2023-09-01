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
package com.amazonaws.amplify.pushnotification.modules;

import android.os.Bundle;
import android.util.Log;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.modules.core.DeviceEventManagerModule;

public class RNPushNotificationJsDelivery {
    private ReactApplicationContext context;

    public RNPushNotificationJsDelivery(ReactApplicationContext reactContext) {
        context = reactContext;
    }

    public void emitNotificationReceived(Bundle bundle) {
        String bundleString = RNPushNotificationCommon.convertJSON(bundle);

        WritableMap params = Arguments.createMap();
        params.putString("dataJSON", bundleString);
        Log.i("emit", "notification emit");
        sendEvent("remoteNotificationReceived", params);
    }

    public void emitTokenReceived(Bundle bundle) {
        String bundleString = RNPushNotificationCommon.convertJSON(bundle);

        WritableMap params = Arguments.createMap();
        params.putString("dataJSON", bundleString);
        Log.i("emit", "token registration");
        sendEvent("remoteTokenReceived", params);
    }

    public void emitNotificationOpened(Bundle bundle) {
        String bundleString = RNPushNotificationCommon.convertJSON(bundle);

        WritableMap params = Arguments.createMap();
        params.putString("dataJSON", bundleString);

        Log.i("emit", "notification opened: " + bundle);
        sendEvent("remoteNotificationOpened", params);
    }

    private void sendEvent(String eventName, Object params) {
            if (context.hasActiveCatalystInstance()) {
                context.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                    .emit(eventName, params);
            }
        }
}
