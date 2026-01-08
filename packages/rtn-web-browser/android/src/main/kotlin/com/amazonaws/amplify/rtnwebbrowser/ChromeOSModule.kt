// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

package com.amazonaws.amplify.rtnwebbrowser

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class ChromeOSModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName() = "ChromeOS"

    @ReactMethod
    fun isChromeOS(promise: Promise) {
        try {
            val isChromeOS = detectChromeOS()
            promise.resolve(isChromeOS)
        } catch (e: Exception) {
            promise.reject("CHROMEOS_DETECTION_ERROR", "Failed to detect ChromeOS", e)
        }
    }

    private fun detectChromeOS(): Boolean {
        return try {
            // Check for Android Runtime for Chrome (ARC) system feature
            val packageManager = reactApplicationContext.packageManager

            packageManager.hasSystemFeature("org.chromium.arc.device_management") ||
                    packageManager.hasSystemFeature("org.chromium.arc")
        } catch (e: Exception) {
            // If we can't check system features, return false
            false
        }
    }
}
