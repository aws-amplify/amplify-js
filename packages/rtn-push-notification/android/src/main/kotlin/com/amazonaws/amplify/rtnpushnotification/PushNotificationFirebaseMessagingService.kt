// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

package com.amazonaws.amplify.rtnpushnotification

import android.content.Intent
import android.os.Bundle
import android.util.Log
import com.amplifyframework.annotations.InternalAmplifyApi
import com.amplifyframework.notifications.pushnotifications.NotificationPayload
import com.facebook.react.HeadlessJsTaskService
import com.facebook.react.bridge.Arguments
import com.google.firebase.messaging.FirebaseMessagingService

@InternalAmplifyApi
private val TAG = PushNotificationFirebaseMessagingService::class.java.simpleName

@InternalAmplifyApi
class PushNotificationFirebaseMessagingService : FirebaseMessagingService() {

    private lateinit var utils: PushNotificationUtils

    override fun onCreate() {
        super.onCreate()
        utils = PushNotificationUtils(baseContext)
    }

    override fun onNewToken(token: String) {
        super.onNewToken(token)
        val params = Arguments.createMap()
        params.putString("token", token)
        Log.d(TAG, "Send device token event")
        PushNotificationEventManager.sendEvent(PushNotificationEventType.TOKEN_RECEIVED, params)
    }

    override fun handleIntent(intent: Intent) {
        val extras = intent.extras ?: Bundle()
        extras.getNotificationPayload()?.let {
            // message contains push notification payload, show notification
            onMessageReceived(it)
        } ?: run {
            Log.d(TAG, "Ignore intents that don't contain push notification payload")
            super.handleIntent(intent)
        }
    }

    private fun onMessageReceived(payload: NotificationPayload) {
        if (utils.isAppInForeground()) {
            Log.d(TAG, "Send foreground message received event")
            PushNotificationEventManager.sendEvent(
                PushNotificationEventType.FOREGROUND_MESSAGE_RECEIVED, payload.toWritableMap()
            )
        } else {
            Log.d(
                TAG, "App is in background, try to create notification and start headless service"
            )

            utils.showNotification(payload)

            try {
                val serviceIntent =
                    Intent(baseContext, PushNotificationHeadlessTaskService::class.java)
                serviceIntent.putExtra("amplifyNotificationPayload", payload)
                if (baseContext.startService(serviceIntent) != null) {
                    HeadlessJsTaskService.acquireWakeLockNow(baseContext)
                }
            } catch (exception: Exception) {
                Log.e(
                    TAG, "Something went wrong while starting headless task: ${exception.message}"
                )
            }
        }
    }
}
