package com.amazonaws.amplify.googlesignin;

import android.accounts.Account;
import android.app.Activity;
import android.content.Intent;
import android.net.Uri;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.BaseActivityEventListener;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.google.android.gms.auth.GoogleAuthException;
import com.google.android.gms.auth.GoogleAuthUtil;
import com.google.android.gms.auth.api.Auth;
import com.google.android.gms.auth.api.signin.GoogleSignInAccount;
import com.google.android.gms.auth.api.signin.GoogleSignInOptions;
import com.google.android.gms.auth.api.signin.GoogleSignInResult;
import com.google.android.gms.auth.api.signin.GoogleSignInStatusCodes;
import com.google.android.gms.common.ConnectionResult;
import com.google.android.gms.common.GoogleApiAvailability;
import com.google.android.gms.common.api.GoogleApiClient;
import com.google.android.gms.common.api.OptionalPendingResult;
import com.google.android.gms.common.api.ResultCallback;
import com.google.android.gms.common.api.Scope;
import com.google.android.gms.common.api.Status;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;


public class RNAmplifyGoogleSignInModule extends ReactContextBaseJavaModule {
    private GoogleApiClient _apiClient;

    public static final int RC_SIGN_IN = 9001;

    public RNAmplifyGoogleSignInModule(final ReactApplicationContext reactContext) {
        super(reactContext);
        reactContext.addActivityEventListener(new RNAmplifyGoogleSignInActivityEventListener());
    }

    private class RNAmplifyGoogleSignInActivityEventListener extends BaseActivityEventListener {
        @Override
        public void onActivityResult(Activity activity, final int requestCode, final int resultCode, final Intent intent) {
            if (requestCode == RNAmplifyGoogleSignInModule.RC_SIGN_IN) {
                GoogleSignInResult result = Auth.GoogleSignInApi.getSignInResultFromIntent(intent);
                handleSignInResult(result, false);
            }
        }
    }

    @Override
    public String getName() {
        return "RNAmplifyGoogleSignIn";
    }

  

    @ReactMethod
    public void playServicesAvailable(boolean autoresolve, Promise promise) {
        final Activity activity = getCurrentActivity();

        if (activity == null) {
            promise.reject("NO_ACTIVITY", "no activity");
            return;
        }

        GoogleApiAvailability googleApiAvailability = GoogleApiAvailability.getInstance();
        int status = googleApiAvailability.isGooglePlayServicesAvailable(activity);

        if(status != ConnectionResult.SUCCESS) {
            promise.reject("" + status, "Play services not available");
            if(autoresolve && googleApiAvailability.isUserResolvableError(status)) {
                googleApiAvailability.getErrorDialog(activity, status, 2404).show();
            }
        }
        else {
            promise.resolve(true);
        }
    }

    @ReactMethod
    public void configure(
            final ReadableArray scopes,
            final String webClientId,
            final Boolean offlineAccess,
            final Boolean forceConsentPrompt,
            final String accountName,
            final String hostedDomain,
            final Promise promise
    ) {
        final Activity activity = getCurrentActivity();

        if (activity == null) {
            promise.reject("NO_ACTIVITY", "NO_ACTIVITY");
            return;
        }

        activity.runOnUiThread(new Runnable() {
            @Override
            public void run() {
                _apiClient = new GoogleApiClient.Builder(activity.getBaseContext())
                        .addApi(Auth.GOOGLE_SIGN_IN_API, getSignInOptions(scopes, webClientId, offlineAccess, forceConsentPrompt, accountName, hostedDomain))
                        .build();
                _apiClient.connect();
                promise.resolve(true);
            }
        });
    }

    @ReactMethod
    public void currentUserAsync() {
        if (_apiClient == null) {
            emitError("RNGoogleSignInSilentError", -1, "GoogleSignin is undefined - call configure first");
            return;
        }

        final Activity activity = getCurrentActivity();

        if (activity == null) {
            emitError("RNGoogleSignInSilentError", -1, "No activity");
            return;
        }


        activity.runOnUiThread(new Runnable() {
            @Override
            public void run() {
                OptionalPendingResult<GoogleSignInResult> opr = Auth.GoogleSignInApi.silentSignIn(_apiClient);

                if (opr.isDone()) {
                    GoogleSignInResult result = opr.get();
                    handleSignInResult(result, true);
                } else {
                    opr.setResultCallback(new ResultCallback<GoogleSignInResult>() {
                        @Override
                        public void onResult(GoogleSignInResult googleSignInResult) {
                            handleSignInResult(googleSignInResult, true);
                        }
                    });
                }
            }
        });
    }


    @ReactMethod
    public void signIn() {
        if (_apiClient == null) {
            emitError("RNGoogleSignInError", -1, "GoogleSignin is undefined - call configure first");
            return;
        }

        final Activity activity = getCurrentActivity();

        if (activity == null) {
            emitError("RNGoogleSignInSilentError", -1, "No activity");
            return;
        }

        activity.runOnUiThread(new Runnable() {
            @Override
            public void run() {
                Intent signInIntent = Auth.GoogleSignInApi.getSignInIntent(_apiClient);
                activity.startActivityForResult(signInIntent, RC_SIGN_IN);
            }
        });
    }

    @ReactMethod
    public void signOut() {
        if (_apiClient == null) {
            emitError("RNGoogleSignOutError", -1, "GoogleSignin is undefined - call configure first");
            return;
        }

        Auth.GoogleSignInApi.signOut(_apiClient).setResultCallback(new ResultCallback<Status>() {
            @Override
            public void onResult(Status status) {
                if (status.isSuccess()) {
                    getReactApplicationContext().getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                            .emit("RNGoogleSignOutSuccess", null);
                } else {
                    int code = status.getStatusCode();
                    String error = GoogleSignInStatusCodes.getStatusCodeString(code);
                    emitError("RNGoogleSignOutError", code, error);
                }
            }
        });
    }

    @ReactMethod
    public void revokeAccess() {
        if (_apiClient == null) {
            emitError("RNGoogleRevokeError", -1, "GoogleSignin is undefined - call configure first");
            return;
        }

        Auth.GoogleSignInApi.revokeAccess(_apiClient).setResultCallback(new ResultCallback<Status>() {
            @Override
            public void onResult(Status status) {
                if (status.isSuccess()) {
                    getReactApplicationContext().getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                            .emit("RNGoogleRevokeSuccess", null);
                } else {
                    int code = status.getStatusCode();
                    String error = GoogleSignInStatusCodes.getStatusCodeString(code);
                    emitError("RNGoogleRevokeError", code, error);
                }
            }
        });
    }

    @ReactMethod
    public void getAccessToken(ReadableMap user, Promise promise) {
        Account acct = new Account(user.getString("email"), "com.google");

        try {
            String token = GoogleAuthUtil.getToken(getReactApplicationContext(), acct, scopesToString(user.getArray("scopes")));
            promise.resolve(token);
        } catch (IOException e) {
            promise.reject(e);
            e.printStackTrace();
        } catch (GoogleAuthException e) {
            promise.reject(e);
            e.printStackTrace();
        }
    }

    /* Private API */

    private  String  scopesToString(ReadableArray scopes) {
        String temp ="oauth2:";
        for (int i = 0; i < scopes.size(); i++) {
            temp += scopes.getString(i)+" ";
        }
        return temp.trim();
    }

    private void emitError(String eventName, int code, String error) {
        WritableMap params = Arguments.createMap();
        params.putInt("code", code);
        params.putString("error", error);
        getReactApplicationContext().getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit(eventName, params);
    }

    private GoogleSignInOptions getSignInOptions(
            final ReadableArray scopes,
            final String webClientId,
            final Boolean offlineAcess,
            final Boolean forceConsentPrompt,
            final String accountName,
            final String hostedDomain
    ) {

        int size = scopes.size();
        Scope[] _scopes = new Scope[size];

        if(scopes != null && size > 0){
            for(int i = 0; i < size; i++){
                if(scopes.getType(i).name().equals("String")){
                    String scope = scopes.getString(i);
                    if (!scope.equals("email")){ // will be added by default
                        _scopes[i] = new Scope(scope);
                    }
                }
            }
        }

        GoogleSignInOptions.Builder googleSignInOptionsBuilder = new GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN).requestScopes(new Scope("email"), _scopes);
        if (webClientId != null && !webClientId.isEmpty()) {
            if (!offlineAcess) {
                googleSignInOptionsBuilder.requestIdToken(webClientId);
            } else {
                googleSignInOptionsBuilder.requestServerAuthCode(webClientId, forceConsentPrompt);
            }
        }
        if (accountName != null && !accountName.isEmpty()) {
            googleSignInOptionsBuilder.setAccountName(accountName);
        }
        if (hostedDomain != null && !hostedDomain.isEmpty()) {
            googleSignInOptionsBuilder.setHostedDomain(hostedDomain);
        }
        return googleSignInOptionsBuilder.build();
    }

    private void handleSignInResult(GoogleSignInResult result, Boolean isSilent) {
        WritableMap params = Arguments.createMap();
        WritableArray scopes = Arguments.createArray();

        if (result != null && result.isSuccess()) {
            GoogleSignInAccount acct = result.getSignInAccount();
            Uri photoUrl = acct.getPhotoUrl();

            for(Scope scope : acct.getGrantedScopes()) {
                String scopeString = scope.toString();
                if (scopeString.startsWith("http")) {
                    scopes.pushString(scopeString);
                }
            }

            params.putString("id", acct.getId());
            params.putString("name", acct.getDisplayName());
            params.putString("givenName", acct.getGivenName());
            params.putString("familyName", acct.getFamilyName());
            params.putString("email", acct.getEmail());
            params.putString("photo", photoUrl != null ? photoUrl.toString() : null);
            params.putString("idToken", acct.getIdToken());
            params.putString("serverAuthCode", acct.getServerAuthCode());
            params.putArray("scopes", scopes);

            getReactApplicationContext().getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                    .emit(isSilent ? "RNGoogleSignInSilentSuccess" : "RNGoogleSignInSuccess" , params);
        } else {
            if (result != null) {
                int code = result.getStatus().getStatusCode();
                String error = GoogleSignInStatusCodes.getStatusCodeString(code);

                params.putInt("code", code);
                params.putString("error", error);
            } else {
                params.putInt("code", -1);
                params.putString("error", "GoogleSignInResult is NULL");
            }
            getReactApplicationContext().getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                    .emit(isSilent ? "RNGoogleSignInSilentError" : "RNGoogleSignInError", params);
        }
    }
}