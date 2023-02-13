// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

package com.amazonaws.amplify.rtnpushnotification

import android.content.Intent
import com.facebook.react.HeadlessJsTaskService
import com.facebook.react.bridge.Arguments
import com.facebook.react.jstasks.HeadlessJsTaskConfig

class PushNotificationHeadlessTaskService : HeadlessJsTaskService() {

    private val defaultTimeout: Long = 10000 // 10 seconds

    override fun getTaskConfig(intent: Intent): HeadlessJsTaskConfig? {
        return intent.extras?.let {
            HeadlessJsTaskConfig(
                HEADLESS_TASK_KEY, Arguments.fromBundle(it), defaultTimeout, true
            )
        }
    }

    companion object {
        const val HEADLESS_TASK_KEY = "PushNotificationHeadlessTaskKey"
    }
}
