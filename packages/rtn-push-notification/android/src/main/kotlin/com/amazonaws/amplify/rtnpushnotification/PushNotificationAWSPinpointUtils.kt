// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

package com.amazonaws.amplify.rtnpushnotification

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.util.Log
import com.amplifyframework.annotations.InternalAmplifyApi
import com.amplifyframework.notifications.pushnotifications.NotificationContentProvider
import com.amplifyframework.notifications.pushnotifications.NotificationPayload
import com.amplifyframework.pushnotifications.pinpoint.PinpointNotificationPayload
import com.amplifyframework.pushnotifications.pinpoint.PushNotificationsConstants
import com.amplifyframework.pushnotifications.pinpoint.PushNotificationsUtils
import com.amplifyframework.pushnotifications.pinpoint.permissions.PermissionRequestResult
import com.amplifyframework.pushnotifications.pinpoint.permissions.PushNotificationPermission
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableMap
import com.google.firebase.messaging.RemoteMessage
import kotlinx.serialization.decodeFromString
import kotlinx.serialization.json.Json
import kotlin.random.Random

private const val TAG = "PushNotificationAWSPinpointUtils"

class PushNotificationPermission(context: Context) {
    private val permission = PushNotificationPermission(context)

    val hasRequiredPermission = permission.hasRequiredPermission

    suspend fun requestPermission(): Boolean {
        return permission.requestPermission() is PermissionRequestResult.Granted
    }
}

@InternalAmplifyApi
class PushNotificationUtils(context: Context) {
    private val utils = PushNotificationsUtils(context)

    fun showNotification(
        payload: NotificationPayload
    ) {
        PinpointNotificationPayload.fromNotificationPayload(payload)?.let {
            if (utils.areNotificationsEnabled() && !it.silentPush) {
                utils.showNotification(
                    payload.notificationId, it, PushNotificationLaunchActivity::class.java
                )
            }
        }
    }

    fun isAppInForeground(): Boolean {
        return utils.isAppInForeground()
    }
}

@InternalAmplifyApi
fun Bundle.getNotificationPayload(): NotificationPayload? {
    val payload = NotificationPayload(NotificationContentProvider.FCM(RemoteMessage(this).data))
    return PinpointNotificationPayload.fromNotificationPayload(payload)
}

@InternalAmplifyApi
fun NotificationPayload?.getProcessedIntent(
    context: Context,
): Intent? {
    // Always launch app
    val notificationIntent: Intent? =
        context.packageManager.getLaunchIntentForPackage(context.packageName)
    this?.let {
        PinpointNotificationPayload.fromNotificationPayload(it)?.action?.let { action ->
            when {
                // Attach action to open url
                action[PushNotificationsConstants.URL] != null -> {
                    notificationIntent?.action = Intent.ACTION_VIEW
                    notificationIntent?.data = Uri.parse(action[PushNotificationsConstants.URL])
                }
                // Attach action to open deep link
                action[PushNotificationsConstants.DEEPLINK] != null -> {
                    notificationIntent?.action = Intent.ACTION_VIEW
                    notificationIntent?.data =
                        Uri.parse(action[PushNotificationsConstants.DEEPLINK])
                }
            }
        }
    }
    return notificationIntent
}

@InternalAmplifyApi
fun NotificationPayload.toWritableMap(): WritableMap {
    val payload = PinpointNotificationPayload.fromNotificationPayload(this)

    // Build actions map
    val action = payload?.action?.let { action ->
        Arguments.createMap().apply {
            action[PushNotificationsConstants.OPENAPP]?.let {
                putString(PushNotificationsConstants.OPENAPP, it)
            }
            action[PushNotificationsConstants.URL]?.let {
                putString(PushNotificationsConstants.URL, it)
            }
            action[PushNotificationsConstants.DEEPLINK]?.let {
                putString(PushNotificationsConstants.DEEPLINK, it)
            }
        }
    }

    // Build rawData map
    val rawData = Arguments.createMap()
    this.rawData.entries.forEach {
        rawData.putString(it.key, it.value)
    }

    // Build and return final map
    return Arguments.createMap().apply {
        payload?.title?.let { putString("title", it) }
        payload?.body?.let { putString("body", it) }
        payload?.imageUrl?.let { putString("imageUrl", it) }
        payload?.channelId?.let { putString("channelId", it) }
        action?.let { putMap("action", action) }
        putMap("rawData", rawData)
    }
}

@InternalAmplifyApi
private val NotificationPayload.notificationId: Int
    get() {
        var sourceId: String?
        var activityId: String?

        // Assign campaign attributes
        sourceId = this.rawData[PushNotificationsConstants.PINPOINT_CAMPAIGN_CAMPAIGN_ID]
        activityId = this.rawData[PushNotificationsConstants.PINPOINT_CAMPAIGN_CAMPAIGN_ACTIVITY_ID]

        // If no campaign id, try to assign journey attributes
        if (sourceId.isNullOrEmpty()) {
            val journeyAttributes = this.rawData[PushNotificationsConstants.PINPOINT_PREFIX]?.let {
                try {
                    Json.decodeFromString<Map<String, Map<String, String>>>(it)[PushNotificationsConstants.JOURNEY]
                } catch (e: Exception) {
                    Log.e(TAG, "Error parsing journey attribute", e)
                    null
                }
            }
            journeyAttributes?.let {
                sourceId = it[PushNotificationsConstants.JOURNEY_ID]
                activityId = it[PushNotificationsConstants.JOURNEY_ACTIVITY_ID]
            }
        }

        // If no activity id (even if campaign was direct send), use a random id, otherwise hash
        // attributes to prevent displaying duplicate notifications from an activity
        return activityId?.let {
            "$sourceId:$activityId".hashCode()
        } ?: Random.nextInt()
    }
