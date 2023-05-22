// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import com.amazonaws.amplify.rtnpushnotification.PushNotificationEventManager
import com.amazonaws.amplify.rtnpushnotification.PushNotificationEventType
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.WritableMap
import com.facebook.react.modules.core.DeviceEventManagerModule.RCTDeviceEventEmitter
import io.mockk.*
import org.junit.Before
import org.junit.Test

class PushNotificationEventManagerTest {
    private val mockContext = mockk<ReactApplicationContext>()
    private val mockEmitter = mockk<RCTDeviceEventEmitter>()
    private val mockMap = mockk<WritableMap>()

    @Before
    fun setup() {
        justRun { mockEmitter.emit(any(), any()) }
        every { mockContext.getJSModule(RCTDeviceEventEmitter::class.java) } returns mockEmitter
    }

    @Test
    fun `queues events and sends when initialized`() {
        PushNotificationEventManager.sendEvent(
            PushNotificationEventType.NOTIFICATION_OPENED, mockMap
        )
        PushNotificationEventManager.sendEvent(
            PushNotificationEventType.NOTIFICATION_OPENED, mockMap
        )
        verify(exactly = 0) {
            mockEmitter.emit(
                PushNotificationEventType.NOTIFICATION_OPENED.value, mockMap
            )
        }

        PushNotificationEventManager.init(mockContext)
        verify(exactly = 2) {
            mockEmitter.emit(
                PushNotificationEventType.NOTIFICATION_OPENED.value, mockMap
            )
        }
    }
}
