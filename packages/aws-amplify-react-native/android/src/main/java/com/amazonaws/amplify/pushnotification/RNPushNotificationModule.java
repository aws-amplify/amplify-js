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