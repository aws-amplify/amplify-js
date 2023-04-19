// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import android.app.Activity
import android.content.Intent
import android.content.SharedPreferences
import androidx.core.app.ActivityCompat
import com.amazonaws.amplify.rtnpushnotification.*
import com.amplifyframework.annotations.InternalAmplifyApi
import com.amplifyframework.notifications.pushnotifications.NotificationContentProvider
import com.amplifyframework.notifications.pushnotifications.NotificationPayload
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.WritableMap
import com.google.android.gms.tasks.OnCompleteListener
import com.google.android.gms.tasks.Task
import com.google.firebase.messaging.FirebaseMessaging
import io.mockk.*
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.launch
import kotlinx.coroutines.runBlocking
import kotlinx.coroutines.test.StandardTestDispatcher
import kotlinx.coroutines.test.advanceUntilIdle
import kotlinx.coroutines.test.runTest
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner

@InternalAmplifyApi
@ExperimentalCoroutinesApi
@RunWith(RobolectricTestRunner::class)
class PushNotificationModuleTest {
    private val mockContext = mockk<ReactApplicationContext>()
    private val mockMap = mockk<WritableMap>()
    private val mockPromise = mockk<Promise>()
    private val mockSharedPreferences = mockk<SharedPreferences>()
    private val mockTask = mockk<Task<String>>()
    private val tokenOnCompleteListenerSlot = slot<OnCompleteListener<String>>()
    private val testPayload = NotificationPayload.Builder(
        NotificationContentProvider.FCM(emptyMap())
    ).build()
    private lateinit var module: PushNotificationModule

    @Before
    fun setup() {
        mockkConstructor(PushNotificationPermission::class)
        mockkObject(PushNotificationEventManager)
        mockkObject(NotificationPayload)
        mockkStatic(ActivityCompat::class)
        mockkStatic(Arguments::class)
        mockkStatic(FirebaseMessaging::class)
        mockkStatic(NotificationPayload::toWritableMap)
        mockkStatic(PushNotificationPermission::class)
        mockkStatic(Task::class)
        justRun {
            mockContext.addActivityEventListener(any())
            mockContext.addLifecycleEventListener(any())
            PushNotificationEventManager.sendEvent(any(), any())
            mockMap.putString(any(), any())
            mockPromise.resolve(any())
        }
        every { mockContext.currentActivity?.intent } returns Intent()
        every { mockContext.getSharedPreferences(any(), any()) } returns mockSharedPreferences
        every { Arguments.createMap() } returns mockMap
        every { FirebaseMessaging.getInstance().token } returns mockTask
        every { NotificationPayload.fromIntent(any()) } returns testPayload
        every { any<NotificationPayload>().toWritableMap() } returns mockMap
        every { mockTask.isSuccessful } returns true
        every { mockTask.result } returns "foo-bar"
        every { mockTask.addOnCompleteListener(capture(tokenOnCompleteListenerSlot)) } answers {
            tokenOnCompleteListenerSlot.captured.onComplete(mockTask)
            mockTask
        }
        every { anyConstructed<PushNotificationPermission>().hasRequiredPermission } returns false
        every { mockSharedPreferences.getBoolean(any(), any()) } returns false
        every { ActivityCompat.shouldShowRequestPermissionRationale(any(), any()) } returns false
        module = PushNotificationModule(mockContext)
    }

    @Test
    fun `returns module name`() {
        assertEquals("AmplifyRTNPushNotification", module.name)
    }

    @Test
    fun `returns constants for use in JS`() {
        assertTrue(module.constants.containsKey("NativeEvent"))
        assertTrue(module.constants.containsKey("NativeHeadlessTaskKey"))
    }

    @Test
    fun `onNewIntent does nothing if intent does not contain payload`() {
        every { NotificationPayload.fromIntent(any()) } returns null
        module.onNewIntent(Intent())
        verify(exactly = 0) { PushNotificationEventManager.sendEvent(any(), any()) }
    }

    @Test
    fun `onNewIntent sends notification opened event if intent contains payload`() {
        module.onNewIntent(Intent())
        verify {
            PushNotificationEventManager.sendEvent(
                PushNotificationEventType.NOTIFICATION_OPENED, mockMap
            )
        }
    }

    @Test
    fun `only first onHostResume call is app launch`() {
        module.onHostResume()
        module.onHostResume()
        verify(exactly = 1) {
            PushNotificationEventManager.sendEvent(
                PushNotificationEventType.TOKEN_RECEIVED, mockMap
            )
            PushNotificationEventManager.sendEvent(
                PushNotificationEventType.LAUNCH_NOTIFICATION_OPENED, mockMap
            )
        }
    }

    @Test
    fun `launch notification is set by app launch and consumed by getLaunchNotification call`() {
        module.onHostResume()
        module.getLaunchNotification(mockPromise)
        module.getLaunchNotification(mockPromise)
        verify(exactly = 1) {
            mockPromise.resolve(mockMap)
            mockPromise.resolve(null)
        }
    }

    @Test
    fun `launch notification is wiped by subsequent app launches`() {
        module.onHostResume()
        module.onHostResume()
        module.getLaunchNotification(mockPromise)
        verify { mockPromise.resolve(null) }
    }

    @Test
    fun `returns ShouldRequest permission status`() {
        module.getPermissionStatus(mockPromise)
        verify { mockPromise.resolve(PushNotificationPermissionStatus.ShouldRequest.name) }
    }

    @Test
    fun `returns ShouldExplainThenRequest permission status`() {
        every { ActivityCompat.shouldShowRequestPermissionRationale(any(), any()) } returns true
        module.getPermissionStatus(mockPromise)
        verify { mockPromise.resolve(PushNotificationPermissionStatus.ShouldExplainThenRequest.name) }
    }

    @Test
    fun `returns Granted permission status`() {
        every { anyConstructed<PushNotificationPermission>().hasRequiredPermission } returns true
        module.getPermissionStatus(mockPromise)
        verify { mockPromise.resolve(PushNotificationPermissionStatus.Granted.name) }
    }

    @Test
    fun `returns Denied permission status`() {
        every { mockSharedPreferences.getBoolean(any(), any()) } returns true
        module.getPermissionStatus(mockPromise)
        verify { mockPromise.resolve(PushNotificationPermissionStatus.Denied.name) }
    }

    @Test
    fun `requests permission`() = runTest {
        val dispatcher = StandardTestDispatcher(testScheduler)
        coEvery { anyConstructed<PushNotificationPermission>().requestPermission() } returns true
        PushNotificationModule(mockContext, dispatcher).requestPermissions(mockk(), mockPromise)
        advanceUntilIdle()
        verify { mockPromise.resolve(true) }
    }

    @Test
    fun `requests permission sets previously denied flag`() = runTest {
        val dispatcher = StandardTestDispatcher(testScheduler)
        val mockSharedPreferencesEditor = mockk<SharedPreferences.Editor>()
        justRun { mockSharedPreferencesEditor.apply() }
        every { ActivityCompat.shouldShowRequestPermissionRationale(any(), any()) } returns true
        every { mockSharedPreferences.edit() } returns mockSharedPreferencesEditor
        every {
            mockSharedPreferencesEditor.putBoolean(
                any(), any()
            )
        } returns mockSharedPreferencesEditor
        coEvery { anyConstructed<PushNotificationPermission>().requestPermission() } returns false
        PushNotificationModule(mockContext, dispatcher).requestPermissions(mockk(), mockPromise)
        advanceUntilIdle()
        verify {
            mockPromise.resolve(false)
            mockSharedPreferencesEditor.putBoolean("wasPermissionPreviouslyDenied", true)
        }
    }
}
