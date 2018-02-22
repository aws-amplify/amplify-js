package com.amazonaws.amplify.pushnotification;

import android.os.Build;
import android.os.Bundle;
import android.util.Log;

import org.json.JSONException;
import org.json.JSONObject;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import java.util.Set;

public class RNPinpointSNSJsDelivery {
    private ReactApplicationContext context;

    public RNPinpointSNSJsDelivery(ReactApplicationContext reactContext) {
        context = reactContext;
    }

    public void emitNotificationReceived(Bundle bundle) {
        String bundleString = RNPushNotificationCommon.convertJSON(bundle);

        WritableMap params = Arguments.createMap();
        params.putString("dataJSON", bundleString);
        Log.v("emit", "notification emit");
        sendEvent("remoteNotificationReceived", params);
    }

    public void emitTokenReceived(Bundle bundle) {
        String bundleString = RNPushNotificationCommon.convertJSON(bundle);
        
        WritableMap params = Arguments.createMap();
        params.putString("dataJSON", bundleString);
        Log.v("emit", "token registration");
        sendEvent("remoteTokenReceived", params);
    }

    private void sendEvent(String eventName, Object params) {
            if (context.hasActiveCatalystInstance()) {
                context.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                    .emit(eventName, params);
            }
        }
}