// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

package com.amazonaws.amplify.rtnpushnotification

import android.app.Activity
import android.content.Context.MODE_PRIVATE
import android.content.Intent
import android.util.Log
import androidx.core.app.ActivityCompat
import com.amplifyframework.annotations.InternalAmplifyApi
import com.amplifyframework.notifications.pushnotifications.NotificationPayload
import com.facebook.react.bridge.*
import com.google.android.gms.tasks.OnCompleteListener
import com.google.firebase.messaging.FirebaseMessaging
import kotlinx.coroutines.*


private val TAG = PushNotificationModule::class.java.simpleName
private const val PERMISSION = "android.permission.POST_NOTIFICATIONS"
private const val PREF_FILE_KEY = "com.amazonaws.amplify.rtnpushnotification"
private const val PREF_PREVIOUSLY_DENIED = "wasPermissionPreviouslyDenied"

enum class PushNotificationPermissionStatus {
    ShouldRequest,
    ShouldExplainThenRequest,
    Granted,
    Denied,
}

class PushNotificationModule(
    reactContext: ReactApplicationContext,
    dispatcher: CoroutineDispatcher = Dispatchers.Main
) : ReactContextBaseJavaModule(reactContext), ActivityEventListener, LifecycleEventListener {

    private var isAppLaunch: Boolean = true
    private var launchNotification: WritableMap? = null
    private val sharedPreferences = reactContext.getSharedPreferences(PREF_FILE_KEY, MODE_PRIVATE)
    private val scope = CoroutineScope(dispatcher)

    init {
        reactContext.addActivityEventListener(this)
        reactContext.addLifecycleEventListener(this)
    }

    @ReactMethod
    fun getLaunchNotification(promise: Promise) {
        launchNotification?.let {
            promise.resolve(launchNotification)
            launchNotification = null
        } ?: promise.resolve(null)
    }

    @ReactMethod
    fun getPermissionStatus(promise: Promise) {
        val permission = PushNotificationPermission(reactApplicationContext)
        // If permission has already been granted
        if (permission.hasRequiredPermission) {
            return promise.resolve(PushNotificationPermissionStatus.Granted.name)
        }
        // If the shouldShowRequestPermissionRationale flag is true, permission must have been
        // denied once (and only once) previously
        if (shouldShowRequestPermissionRationale()) {
            return promise.resolve(PushNotificationPermissionStatus.ShouldExplainThenRequest.name)
        }
        // If the shouldShowRequestPermissionRationale flag is false and the permission was
        // already previously denied then user has denied permissions twice
        if (sharedPreferences.getBoolean(PREF_PREVIOUSLY_DENIED, false)) {
            return promise.resolve(PushNotificationPermissionStatus.Denied.name)
        }
        // Otherwise it's never been requested (or user could have dismissed the request without
        // explicitly denying)
        promise.resolve(PushNotificationPermissionStatus.ShouldRequest.name)
    }

    @ReactMethod
    fun requestPermissions(
        @Suppress("UNUSED_PARAMETER") permissions: ReadableMap,
        promise: Promise
    ) {
        scope.launch {
            val permission = PushNotificationPermission(reactApplicationContext)
            if (permission.requestPermission()) {
                promise.resolve(true)
            } else {
                // If permission was not granted and the shouldShowRequestPermissionRationale flag
                // is true then user must have denied for the first time. We will set the
                // wasPermissionPreviouslyDenied value to true only in this scenario since it's
                // possible to dismiss the permission request without explicitly denying as well.
                if (shouldShowRequestPermissionRationale()) {
                    with(sharedPreferences.edit()) {
                        putBoolean(PREF_PREVIOUSLY_DENIED, true)
                        apply()
                    }
                }
                promise.resolve(false)
            }
        }
    }

    @ReactMethod
    fun addListener(@Suppress("UNUSED_PARAMETER") eventName: String) {
        // noop - only required for RN NativeEventEmitter
    }

    @ReactMethod
    fun removeListeners(@Suppress("UNUSED_PARAMETER") count: Int) {
        // noop - only required for RN NativeEventEmitter
    }

    override fun getName() = "AmplifyRTNPushNotification"

    override fun getConstants(): MutableMap<String, Any> = hashMapOf(
        "NativeEvent" to PushNotificationEventType.values()
            .associateBy({ it.name }, { it.value }),
        "NativeHeadlessTaskKey" to PushNotificationHeadlessTaskService.HEADLESS_TASK_KEY
    )

    override fun onActivityResult(p0: Activity?, p1: Int, p2: Int, p3: Intent?) {
        // noop - only overridden as this class implements ActivityEventListener
    }

    /**
     * Send notification opened app event to JS layer if the app is in a background state
     */
    @InternalAmplifyApi
    override fun onNewIntent(intent: Intent) {
        val payload = NotificationPayload.fromIntent(intent)
        if (payload != null) {
            PushNotificationEventManager.sendEvent(
                PushNotificationEventType.NOTIFICATION_OPENED, payload.toWritableMap()
            )
        }
    }

    /**
     * On every app resume (including launch), send the current device token to JS layer. Also
     * store the app launching notification if app is in a quit state
     */
    @InternalAmplifyApi
    override fun onHostResume() {
        if (isAppLaunch) {
            isAppLaunch = false
            PushNotificationEventManager.init(reactApplicationContext)
            val firebaseInstance = FirebaseMessaging.getInstance()
            firebaseInstance.token.addOnCompleteListener(OnCompleteListener { task ->
                if (!task.isSuccessful) {
                    Log.w(TAG, "Fetching FCM registration token failed")
                    return@OnCompleteListener
                }
                val params = Arguments.createMap().apply {
                    putString("token", task.result)
                }
                Log.d(TAG, "Send device token event")
                PushNotificationEventManager.sendEvent(
                    PushNotificationEventType.TOKEN_RECEIVED,
                    params
                )
            })
            currentActivity?.intent?.let {
                val payload = NotificationPayload.fromIntent(it)
                if (payload != null) {
                    launchNotification = payload.toWritableMap()
                    // Launch notification opened event is emitted for internal use only
                    PushNotificationEventManager.sendEvent(
                        PushNotificationEventType.LAUNCH_NOTIFICATION_OPENED,
                        payload.toWritableMap()
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
        scope.cancel()
    }

    private fun shouldShowRequestPermissionRationale(): Boolean {
        return ActivityCompat.shouldShowRequestPermissionRationale(currentActivity!!, PERMISSION)
    }
}
