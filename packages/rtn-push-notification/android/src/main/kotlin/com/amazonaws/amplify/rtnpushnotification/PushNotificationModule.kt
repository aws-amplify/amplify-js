// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

package com.amazonaws.amplify.rtnpushnotification

import android.app.Activity
import android.content.Intent
import android.util.Log
import com.amplifyframework.pushnotifications.pinpoint.utils.permissions.PermissionRequestResult
import com.amplifyframework.pushnotifications.pinpoint.utils.permissions.PushNotificationPermission
import com.facebook.react.bridge.*
import com.google.android.gms.tasks.OnCompleteListener
import com.google.firebase.messaging.FirebaseMessaging
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

enum class PushNotificationPermissionStatus(val value: String) {
    GRANTED("Granted"),
    DENIED("Denied"),
}

class PushNotificationModule(
    reactContext: ReactApplicationContext
) : ReactContextBaseJavaModule(reactContext), ActivityEventListener, LifecycleEventListener {

    private var isAppLaunch: Boolean = true
    private var launchNotification: WritableMap? = null

    init {
        reactContext.addActivityEventListener(this)
        reactContext.addLifecycleEventListener(this)
    }

    @ReactMethod
    fun getToken(promise: Promise) {
        val firebaseInstance = FirebaseMessaging.getInstance()
        firebaseInstance.token.addOnCompleteListener(OnCompleteListener { task ->
            if (!task.isSuccessful) {
                Log.w(TAG, "Fetching FCM registration token failed")
                promise.reject(task.exception)
                return@OnCompleteListener
            }
            promise.resolve(task.result)
        })
    }

    @ReactMethod
    fun getLaunchNotification(promise: Promise) {
        launchNotification?.let {
            promise.resolve(launchNotification)
            launchNotification = null
        } ?: promise.resolve(null)
    }

    @ReactMethod
    fun requestMessagingPermission(promise: Promise) {
        CoroutineScope(Dispatchers.Main).launch {
            val permission = PushNotificationPermission(reactApplicationContext)
            val result = permission.requestPermission()
            if (result is PermissionRequestResult.Granted) {
                promise.resolve(PushNotificationPermissionStatus.GRANTED.value)
            } else {
                promise.resolve(PushNotificationPermissionStatus.DENIED.value)
            }
        }
    }

    @ReactMethod
    fun addListener(eventName: String) {
        // noop - only required for RN NativeEventEmitter
    }

    @ReactMethod
    fun removeListeners(count: Int) {
        // noop - only required for RN NativeEventEmitter
    }

    override fun getName() = "AmplifyRTNPushNotification"

    override fun getConstants(): MutableMap<String, Any> = hashMapOf(
        "NativeEvent" to PushNotificationEventType.values()
            .associateBy({ it.toString() }, { it.value }),
        "NativeHeadlessTaskKey" to PushNotificationHeadlessTaskService.HEADLESS_TASK_KEY
    )

    override fun onActivityResult(p0: Activity?, p1: Int, p2: Int, p3: Intent?) {
        // noop - only overridden as this class implements ActivityEventListener
    }

    /**
     * Send notification opened app event to JS layer if the app is in a background state
     */
    override fun onNewIntent(intent: Intent?) {
        intent?.let {
            val payload = getPayloadFromTempExtras(it.extras)
            if (payload != null) {
                val params = Arguments.fromBundle(payload.bundle())
                PushNotificationEventManager.sendEvent(
                    PushNotificationEventType.NOTIFICATION_OPENED, params
                )
            }
        }
    }

    /**
     * Store the app launching notification if app is in a quit state
     */
    override fun onHostResume() {
        val firebaseInstance = FirebaseMessaging.getInstance()
        firebaseInstance.token.addOnCompleteListener(OnCompleteListener { task ->
            if (!task.isSuccessful) {
                Log.w(TAG, "Fetching FCM registration token failed")
                return@OnCompleteListener
            }
            val params = Arguments.createMap()
            params.putString("token", task.result)
            Log.d(TAG, "Send device token event")
            PushNotificationEventManager.sendEvent(PushNotificationEventType.TOKEN_RECEIVED, params)
        })
        if (isAppLaunch) {
            isAppLaunch = false
            PushNotificationEventManager.init(reactApplicationContext)
            currentActivity?.intent?.let {
                val payload = getPayloadFromTempExtras(it.extras)
                if (payload != null) {
                    launchNotification = Arguments.fromBundle(payload.bundle())
                    // Launch notification opened event is emitted for internal use only
                    val params = Arguments.fromBundle(payload.bundle())
                    PushNotificationEventManager.sendEvent(
                        PushNotificationEventType.LAUNCH_NOTIFICATION_OPENED, params
                    )
                }
            }
        } else {
            // Wipe the launching notification as app was re-opened by some other means
            launchNotification = null
        }
    }

    override fun onHostPause() {
        // noop - only overridden as this class implements LifecycleEventListener
    }

    override fun onHostDestroy() {
        // noop - only overridden as this class implements LifecycleEventListener
    }

    companion object {
        private val TAG = PushNotificationModule::class.java.simpleName
    }
}
