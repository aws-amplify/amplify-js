// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

package com.amazonaws.amplify.rtnpushnotification

import android.os.Bundle
import com.amplifyframework.pushnotifications.pinpoint.utils.NotificationPayload
import com.amplifyframework.pushnotifications.pinpoint.utils.PushNotificationsConstants
import com.google.firebase.messaging.RemoteMessage

fun isRemoteMessageSupported(remoteMessage: RemoteMessage): Boolean {
    return !remoteMessage.data["pinpoint.campaign.campaign_id"].isNullOrEmpty()
}

fun getPayloadFromRemoteMessage(remoteMessage: RemoteMessage): NotificationPayload {
    val data = remoteMessage.data
    val body = remoteMessage.notification?.body
        ?: data["message"]
        ?: data[PushNotificationsConstants.AWS_PINPOINT_NOTIFICATION_BODY]
    val title = remoteMessage.notification?.title
        ?: data["title"]
        ?: data[PushNotificationsConstants.AWS_PINPOINT_NOTIFICATION_TITLE]
    val imageUrl = remoteMessage.notification?.imageUrl?.toString()
        ?: data["imageUrl"]
        ?: data[PushNotificationsConstants.AWS_PINPOINT_NOTIFICATION_IMAGE]
    val action: HashMap<String, String> = HashMap()
    data[PushNotificationsConstants.AWS_PINPOINT_OPENAPP]?.let {
        action.put(PushNotificationsConstants.AWS_PINPOINT_OPENAPP, it)
    }
    data[PushNotificationsConstants.AWS_PINPOINT_URL]?.let {
        // force HTTPS URL scheme
        val urlHttps = it.replaceFirst("http", "https")
        action.put(PushNotificationsConstants.AWS_PINPOINT_URL, urlHttps)
    }
    data[PushNotificationsConstants.AWS_PINPOINT_DEEPLINK]?.let {
        action.put(PushNotificationsConstants.AWS_PINPOINT_DEEPLINK, it)
    }

    return NotificationPayload {
        notification(title, body, imageUrl)
        tapAction(action)
        silentPush =
            data[PushNotificationsConstants.AWS_PINPOINT_NOTIFICATION_SILENTPUSH].equals("1")
        rawData = HashMap(data)
    }
}

// TODO: Remove this function when utils package better supports this
@Suppress("UNCHECKED_CAST")
fun getPayloadFromTempExtras(extras: Bundle?): NotificationPayload? {
    extras?.getSerializable("rawData")?.let { data ->
        if (data is HashMap<*, *>) {
            val body = data[PushNotificationsConstants.AWS_PINPOINT_NOTIFICATION_BODY] as String?
            val title = data[PushNotificationsConstants.AWS_PINPOINT_NOTIFICATION_TITLE] as String?
            val imageUrl = data[PushNotificationsConstants.AWS_PINPOINT_NOTIFICATION_IMAGE] as String?
            val action: HashMap<String, String> = HashMap()
            data[PushNotificationsConstants.AWS_PINPOINT_OPENAPP]?.let {
                action.put(PushNotificationsConstants.AWS_PINPOINT_OPENAPP, it as String)
            }
            data[PushNotificationsConstants.AWS_PINPOINT_URL]?.let {
                action.put(PushNotificationsConstants.AWS_PINPOINT_URL, it as String)
            }
            data[PushNotificationsConstants.AWS_PINPOINT_DEEPLINK]?.let {
                action.put(PushNotificationsConstants.AWS_PINPOINT_DEEPLINK, it as String)
            }
            return NotificationPayload {
                notification(title, body, imageUrl)
                tapAction(action)
                silentPush =
                    (data[PushNotificationsConstants.AWS_PINPOINT_NOTIFICATION_SILENTPUSH] as String?) == "1"
                rawData = data as HashMap<String, String>
            }
        }
        return null
    } ?: return null
}
