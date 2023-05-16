// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

package com.amazonaws.amplify.rtnpushnotification

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.WritableMap
import com.facebook.react.modules.core.DeviceEventManagerModule

enum class PushNotificationEventType(val value: String) {
    FOREGROUND_MESSAGE_RECEIVED("ForegroundMessageReceived"),
    LAUNCH_NOTIFICATION_OPENED("LaunchNotificationOpened"),
    NOTIFICATION_OPENED("NotificationOpened"),
    TOKEN_RECEIVED("TokenReceived")
}

class PushNotificationEvent(val type: PushNotificationEventType, val params: WritableMap?)

object PushNotificationEventManager {
    private lateinit var reactContext: ReactApplicationContext
    private var isInitialized: Boolean = false
    private val eventQueue: MutableList<PushNotificationEvent> = mutableListOf()

    fun init(reactContext: ReactApplicationContext) {
        this.reactContext = reactContext
        isInitialized = true
        flushEventQueue()
    }

    fun sendEvent(type: PushNotificationEventType, params: WritableMap?) {
        if (!isInitialized) {
            eventQueue.add(PushNotificationEvent(type, params))
        } else {
            sendJSEvent(type, params)
        }
    }

    private fun sendJSEvent(type: PushNotificationEventType, params: WritableMap?) {
        reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            ?.emit(type.value, params)
    }

    private fun flushEventQueue() {
        eventQueue.forEach {
            sendJSEvent(it.type, it.params)
        }
        eventQueue.clear()
    }
}
