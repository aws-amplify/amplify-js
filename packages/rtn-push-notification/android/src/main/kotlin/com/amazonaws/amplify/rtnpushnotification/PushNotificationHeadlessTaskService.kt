// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

package com.amazonaws.amplify.rtnpushnotification

import android.content.Intent
import com.amplifyframework.annotations.InternalAmplifyApi
import com.amplifyframework.notifications.pushnotifications.NotificationPayload
import com.facebook.react.HeadlessJsTaskService
import com.facebook.react.jstasks.HeadlessJsTaskConfig

class PushNotificationHeadlessTaskService : HeadlessJsTaskService() {

    private val defaultTimeout: Long = 10000 // 10 seconds

    @InternalAmplifyApi
    override fun getTaskConfig(intent: Intent): HeadlessJsTaskConfig? {
        return NotificationPayload.fromIntent(intent)?.let {
            HeadlessJsTaskConfig(
                HEADLESS_TASK_KEY, it.toWritableMap(), defaultTimeout, true
            )
        }
    }

    companion object {
        const val HEADLESS_TASK_KEY = "PushNotificationHeadlessTaskKey"
    }
}
