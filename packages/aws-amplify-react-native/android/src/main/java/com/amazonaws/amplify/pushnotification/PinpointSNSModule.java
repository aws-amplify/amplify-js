package com.amazonaws.amplify.pushnotification;

import android.util.Log;

import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import com.amazonaws.AmazonClientException;
import com.amazonaws.auth.CognitoCachingCredentialsProvider;
import com.amazonaws.mobileconnectors.pinpoint.PinpointConfiguration;
import com.amazonaws.mobileconnectors.pinpoint.PinpointManager;
import com.amazonaws.regions.Regions;
import com.amazonaws.services.pinpoint.model.ChannelType;
import com.google.firebase.iid.FirebaseInstanceId;

public class PinpointSNSModule extends ReactContextBaseJavaModule {
    private static final String LOG_TAG = PinpointSNSModule.class.getSimpleName();
    private static PinpointManager pinpointManager = null;

    public PinpointSNSModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "PinpointSNS";
    }    

    @ReactMethod
    public void initialize(final String appId, final String region, final String identityPoolID) {
        ReactApplicationContext context = getReactApplicationContext();
        Log.e(LOG_TAG, "initialize pinpoint manager");
        String refreshedToken = FirebaseInstanceId.getInstance().getToken();

        Regions pinpointRegion = null;
        switch (region) {
            case "us-east-1":
                pinpointRegion = Regions.US_EAST_1;
                break;
            default:
                break;
        }

        final ChannelType pinpointChannelType = ChannelType.GCM;

        CognitoCachingCredentialsProvider cognitoCachingCredentialsProvider = new CognitoCachingCredentialsProvider(context, identityPoolID, pinpointRegion);

        try {
            final PinpointConfiguration config =
                    new PinpointConfiguration(context, appId, pinpointRegion, pinpointChannelType, cognitoCachingCredentialsProvider);

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