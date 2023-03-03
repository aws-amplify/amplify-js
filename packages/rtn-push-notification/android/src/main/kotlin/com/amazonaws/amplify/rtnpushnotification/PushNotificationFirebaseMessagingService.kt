// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

package com.amazonaws.amplify.rtnpushnotification

import android.content.Intent
import android.os.Bundle
import android.util.Log
import com.amplifyframework.pushnotifications.pinpoint.utils.processRemoteMessage
import com.amplifyframework.pushnotifications.pinpoint.utils.PushNotificationsUtils
import com.facebook.react.HeadlessJsTaskService
import com.facebook.react.bridge.Arguments
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage

private val TAG = PushNotificationFirebaseMessagingService::class.java.simpleName
private const val ACTION_NEW_TOKEN = "com.google.firebase.messaging.NEW_TOKEN"

class PushNotificationFirebaseMessagingService : FirebaseMessagingService() {

    private lateinit var utils: PushNotificationsUtils

    override fun onCreate() {
        super.onCreate()
        utils = PushNotificationsUtils(baseContext)
    }

    override fun onNewToken(token: String) {
        val params = Arguments.createMap()
        params.putString("token", token)
        Log.d(TAG, "Send device token event")
        PushNotificationEventManager.sendEvent(PushNotificationEventType.TOKEN_RECEIVED, params)
    }

    override fun handleIntent(intent: Intent) {
        // If the intent is for a new token, just forward intent to Firebase SDK
        if (intent.action == ACTION_NEW_TOKEN) {
            Log.d(TAG, "Received new token intent")
            super.handleIntent(intent)
            return
        }

        val extras = intent.extras ?: Bundle()

        // If we can't handle the message type coming in, just forward the intent to Firebase SDK
        if (!isExtrasSupported(extras)) {
            Log.i(TAG, "Message payload is not supported")
            super.handleIntent(intent)
            return
        }

        // Otherwise, try to handle the message
        onMessageReceived(RemoteMessage(extras))
    }

    override fun onMessageReceived(remoteMessage: RemoteMessage) {
        val payload = processRemoteMessage(remoteMessage)

        if (utils.isAppInForeground()) {
            Log.d(TAG, "Send foreground message received event")
            val params = Arguments.fromBundle(payload.bundle())
            PushNotificationEventManager.sendEvent(
                PushNotificationEventType.FOREGROUND_MESSAGE_RECEIVED, params
            )
        } else {
            Log.d(
                TAG, "App is in background, try to create notification and start headless service"
            )

            utils.showNotification(payload, PushNotificationLaunchActivity::class.java)

            try {
                val serviceIntent =
                    Intent(baseContext, PushNotificationHeadlessTaskService::class.java)
                serviceIntent.putExtras(payload.bundle())
                if (baseContext.startService(serviceIntent) != null) {
                    HeadlessJsTaskService.acquireWakeLockNow(baseContext)
                }
            } catch (exception: Exception) {
                Log.e(
                    TAG,
                    "Something went wrong while starting headless task: ${exception.message}"
                )
            }
        }
    }
}
