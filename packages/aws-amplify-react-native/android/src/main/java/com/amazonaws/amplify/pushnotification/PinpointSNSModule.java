package com.amazonaws.amplify.pushnotification;

import android.util.Log;

import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import com.amazonaws.AmazonClientException;
import com.amazonaws.auth.CognitoCachingCredentialsProvider;
import com.amazonaws.mobile.config.AWSConfiguration;
import com.amazonaws.mobileconnectors.pinpoint.PinpointConfiguration;
import com.amazonaws.mobileconnectors.pinpoint.PinpointManager;
import com.amazonaws.regions.Regions;
import com.amazonaws.mobile.auth.core.IdentityManager;
import com.google.firebase.iid.FirebaseInstanceId;

public class PinpointSNSModule extends ReactContextBaseJavaModule {
    private static final String LOG_TAG = PinpointSNSModule.class.getSimpleName();

    private static final String IDENTITY_POOL_ID = "us-east-1:e1bef532-73f3-40b2-86d7-e9e5224f3e83";
    private static final String APP_ID = "5d6fbb4954064bbf8dbfcabea72ed080";
    public static AWSConfiguration awsConfiguration;

    private static PinpointManager pinpointManager = null;

    public PinpointSNSModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "PinpointSNS";
    }    

    @ReactMethod
    public void initialize() {
        ReactApplicationContext context = getReactApplicationContext();
        Log.e(LOG_TAG, "initialize pinpoint manager");
        String refreshedToken = FirebaseInstanceId.getInstance().getToken();

        awsConfiguration = new AWSConfiguration(context);

        if (IdentityManager.getDefaultIdentityManager() == null) {
            final IdentityManager identityManager = new IdentityManager(context, awsConfiguration);
            IdentityManager.setDefaultIdentityManager(identityManager);
        }

        try {
            final PinpointConfiguration config =
                    new PinpointConfiguration(context,
                            IdentityManager.getDefaultIdentityManager().getCredentialsProvider(),
                            awsConfiguration);
            PinpointSNSModule.pinpointManager = new PinpointManager(config);
            Log.e(LOG_TAG, "token: " + refreshedToken);
            PinpointSNSModule.getPinpointManager().getNotificationClient().registerGCMDeviceToken(refreshedToken);

        } catch (final AmazonClientException ex) {
            Log.e(LOG_TAG, "Unable to initialize PinpointManager. " + ex.getMessage(), ex);
        }
    }

    public static PinpointManager getPinpointManager() {
        return pinpointManager;
    }
}