// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

package com.amazonaws.amplify.rtnpushnotification

import android.content.Context
import android.util.Log

fun getLaunchActivityClass(context: Context): Class<*>? {
    val packageName = context.packageName
    val launchIntent = context.packageManager.getLaunchIntentForPackage(packageName)
    launchIntent?.component?.className?.let {
        try {
            return Class.forName(it)
        } catch (e: Exception) {
            Log.e(
                "PushNotificationUtils", "Unable to find launch activity class"
            )
        }
    }
    return null
}
