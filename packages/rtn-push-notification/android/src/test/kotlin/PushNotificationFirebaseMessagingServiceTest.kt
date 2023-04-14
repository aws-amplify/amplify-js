// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import android.content.Intent
import android.os.Bundle
import com.amazonaws.amplify.rtnpushnotification.*
import com.amplifyframework.annotations.InternalAmplifyApi
import com.amplifyframework.notifications.pushnotifications.NotificationContentProvider
import com.amplifyframework.notifications.pushnotifications.NotificationPayload
import com.facebook.react.HeadlessJsTaskService
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableMap
import io.mockk.*
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.Robolectric.buildService
import org.robolectric.RobolectricTestRunner
import org.robolectric.RuntimeEnvironment
import org.robolectric.android.controller.ServiceController

@InternalAmplifyApi
@RunWith(RobolectricTestRunner::class)
class PushNotificationFirebaseMessagingServiceTest {
    private object TestConst {
        const val TOKEN = "foo-bar"
    }

    private val mockMap = mockk<WritableMap>()
    private val testPayload = NotificationPayload.Builder(
        NotificationContentProvider.FCM(
            content = mapOf()
        )
    ).build()
    private lateinit var controller: ServiceController<PushNotificationFirebaseMessagingService>

    @Before
    fun setup() {
        mockkConstructor(PushNotificationUtils::class)
        mockkObject(PushNotificationEventManager)
        mockkStatic(Arguments::class)
        mockkStatic(Bundle::getNotificationPayload)
        mockkStatic(HeadlessJsTaskService::class)
        mockkStatic(NotificationPayload::toWritableMap)
        justRun {
            PushNotificationEventManager.sendEvent(any(), any())
            mockMap.putString(any(), any())
            HeadlessJsTaskService.acquireWakeLockNow(any())
            anyConstructed<PushNotificationUtils>().showNotification(any())
        }
        every { any<NotificationPayload>().toWritableMap() } returns mockMap
        every { Arguments.createMap() } returns mockMap
        every { any<Bundle>().getNotificationPayload() } returns testPayload
        controller = buildService(PushNotificationFirebaseMessagingService::class.java, Intent())
    }

    @Test
    fun `sends token received event on new token`() {
        controller.create().get().onNewToken(TestConst.TOKEN)

        verify {
            PushNotificationEventManager.sendEvent(
                PushNotificationEventType.TOKEN_RECEIVED,
                mockMap
            )
        }
    }

    @Test
    fun `handles message in foreground`() {
        every { anyConstructed<PushNotificationUtils>().isAppInForeground() } returns true
        controller.create().get().handleIntent(Intent())

        verify {
            PushNotificationEventManager.sendEvent(
                PushNotificationEventType.FOREGROUND_MESSAGE_RECEIVED,
                mockMap
            )
        }
    }

    @Test
    fun `handles message in background`() {
        every { anyConstructed<PushNotificationUtils>().isAppInForeground() } returns false
        controller.create().get().handleIntent(Intent())

        verify {
            anyConstructed<PushNotificationUtils>().showNotification(testPayload)
            HeadlessJsTaskService.acquireWakeLockNow(RuntimeEnvironment.getApplication().baseContext)
        }
    }
}
