package com.amazonaws.amplify.pushnotification.modules;

import android.os.Build;
import android.os.Bundle;
import android.util.Log;

import org.json.JSONException;
import org.json.JSONObject;

import java.util.Set;

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

    private void sendEvent(String eventName, Object params) {
            if (context.hasActiveCatalystInstance()) {
                context.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                    .emit(eventName, params);
            }
        }
}