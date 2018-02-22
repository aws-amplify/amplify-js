package com.amazonaws.amplify.pushnotification;

import android.util.Log;
import android.os.Bundle;

import com.google.firebase.iid.FirebaseInstanceId;
import com.google.firebase.iid.FirebaseInstanceIdService;
import android.os.Bundle;

import com.facebook.react.ReactApplication;
import com.facebook.react.ReactInstanceManager;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;

import com.amazonaws.amplify.pushnotification.modules.RNPushNotificationJsDelivery;

public class RNPushNotificationDeviceIDService extends FirebaseInstanceIdService {

    private static final String TAG = "RNPushNotificationDeviceIDService";

    /**
     * Called if InstanceID token is updated. This may occur if the security of
     * the previous token had been compromised. Note that this is called when the InstanceID token
     * is initially generated so this is where you would retrieve the token.
     */
    @Override
    public void onTokenRefresh() {
        // Get updated InstanceID token.
        String refreshedToken = FirebaseInstanceId.getInstance().getToken();
        Log.v(TAG, "Refreshed token: " + refreshedToken);

        ReactInstanceManager mReactInstanceManager = ((ReactApplication) getApplication()).getReactNativeHost().getReactInstanceManager();
        ReactContext context = mReactInstanceManager.getCurrentReactContext();

        RNPushNotificationJsDelivery jsDelivery = new RNPushNotificationJsDelivery((ReactApplicationContext) context);
        Bundle bundle = convertMessageToBundle(refreshedToken);
        jsDelivery.emitTokenReceived(bundle);
    }

    private Bundle convertMessageToBundle(String token) {
        Bundle bundle = new Bundle();
        bundle.putString("refreshToken", token);
        return bundle;
    }
}
