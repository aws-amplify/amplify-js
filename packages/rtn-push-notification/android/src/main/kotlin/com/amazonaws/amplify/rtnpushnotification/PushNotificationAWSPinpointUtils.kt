// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

package com.amazonaws.amplify.rtnpushnotification

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import com.amplifyframework.pushnotifications.pinpoint.utils.NotificationPayload
import com.amplifyframework.pushnotifications.pinpoint.utils.PushNotificationsConstants
import com.amplifyframework.pushnotifications.pinpoint.utils.toNotificationsPayload

private const val PAYLOAD_KEY = "payload"

fun isExtrasSupported(extras: Bundle): Boolean {
    return extras.keySet().any { it.contains(PushNotificationsConstants.PINPOINT_PREFIX) }
}

fun processNotificationIntent(context: Context, payload: NotificationPayload?): Intent? {
    // Always launch app
    val notificationIntent: Intent? =
        context.packageManager.getLaunchIntentForPackage(context.packageName)
    payload?.action?.let {
        // Attach action to open url
        if (it.containsKey(PushNotificationsConstants.PINPOINT_URL)) {
            notificationIntent?.action = Intent.ACTION_VIEW
            notificationIntent?.data = Uri.parse(it[PushNotificationsConstants.PINPOINT_URL])
        }
        // Attach action to open deep link
        else if (it.containsKey(PushNotificationsConstants.PINPOINT_DEEPLINK)) {
            notificationIntent?.action = Intent.ACTION_VIEW
            notificationIntent?.data = Uri.parse(it[PushNotificationsConstants.PINPOINT_DEEPLINK])
        }
    }
    return notificationIntent
}

fun getPayloadFromExtras(extras: Bundle?): NotificationPayload? {
    return extras?.getBundle(PAYLOAD_KEY)?.toNotificationsPayload()
}
