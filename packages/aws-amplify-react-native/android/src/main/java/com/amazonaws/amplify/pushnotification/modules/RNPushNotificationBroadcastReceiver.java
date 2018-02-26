package com.amazonaws.amplify.pushnotification.modules;

import java.util.HashMap;
import java.util.Map;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.util.Log;
/**
 * The Amazon Pinpoint push notification receiver.
 */
public class RNPushNotificationBroadcastReceiver extends BroadcastReceiver {

    private final static String LOG_TAG = "RNPushNotificationBroadcastReceiver";
    private static volatile RNPushNotificationHelper rnPushNotificationHelper = null;
    @Override
    public void onReceive(Context context, Intent intent) {
        Log.v(LOG_TAG, "broadcaster received");
    }

    public static void setNotificationClient(RNPushNotificationHelper rnPushNotificationHelper) {
        RNPushNotificationBroadcastReceiver.rnPushNotificationHelper = rnPushNotificationHelper;
    }
}