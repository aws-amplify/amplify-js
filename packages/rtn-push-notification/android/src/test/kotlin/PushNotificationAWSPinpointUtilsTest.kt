// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.os.Bundle
import com.amazonaws.amplify.rtnpushnotification.*
import com.amplifyframework.annotations.InternalAmplifyApi
import com.amplifyframework.notifications.pushnotifications.NotificationContentProvider
import com.amplifyframework.notifications.pushnotifications.NotificationPayload
import com.amplifyframework.pushnotifications.pinpoint.PushNotificationsConstants
import com.amplifyframework.pushnotifications.pinpoint.PushNotificationsUtils
import com.amplifyframework.pushnotifications.pinpoint.permissions.PermissionRequestResult
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableMap
import io.mockk.*
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.test.runTest
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import org.junit.Assert.*
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.RuntimeEnvironment
import org.robolectric.Shadows.shadowOf
import kotlin.random.Random
import com.amplifyframework.pushnotifications.pinpoint.permissions.PushNotificationPermission as CommonPushNotificationPermission

@InternalAmplifyApi
@ExperimentalCoroutinesApi
@RunWith(RobolectricTestRunner::class)
class PushNotificationAWSPinpointUtilsTest {
    private object TestConst {
        const val ADHOC_KEY = "foo"
        const val ADHOC_VAL = "bar"
        const val BODY = "body"
        const val CAMPAIGN_ID = "campaign-id"
        const val CAMPAIGN_ACTIVITY_ID = "campaign-activity-id"
        const val DEEPLINK_URL = "deeplink://url"
        const val IMAGE_URL = "http://image.fakeurl/avocado.png"
        const val JOURNEY_ID = "journey-id"
        const val JOURNEY_ACTIVITY_ID = "journey-id"
        const val RANDOM_INT = 123
        const val TITLE = "title"
        const val URL = "https://goto.fakeurl"
    }

    private fun getTestPayload(data: Map<String, String> = mapOf()): NotificationPayload {
        return NotificationPayload.Builder(
            NotificationContentProvider.FCM(
                mapOf(PushNotificationsConstants.PINPOINT_PREFIX to "").plus(data)
            )
        ).build()
    }

    private val launchIntentFilter = IntentFilter(Intent.ACTION_MAIN).apply {
        addCategory(Intent.CATEGORY_LAUNCHER)
    }
    private val mockMap = mockk<WritableMap>()
    private lateinit var context: Context

    @Before
    fun setup() {
        context = RuntimeEnvironment.getApplication().applicationContext
        mockkConstructor(CommonPushNotificationPermission::class)
        mockkConstructor(PushNotificationsUtils::class)
        mockkObject(Random)
        mockkStatic(Arguments::class)
        justRun {
            mockMap.putMap(any(), any())
            mockMap.putString(any(), any())
            anyConstructed<PushNotificationsUtils>().showNotification(any(), any(), any())
        }
        every { Random.nextInt() } returns TestConst.RANDOM_INT
        every { anyConstructed<PushNotificationsUtils>().areNotificationsEnabled() } returns true
        every { Arguments.createMap() } returns mockMap
        val component = ComponentName(context.packageName, "TestMainActivity")
        shadowOf(context.packageManager).apply {
            addActivityIfNotPresent(component)
            addIntentFilterForActivity(component, launchIntentFilter)
        }
    }

    @Test
    fun `returns permission status`() {
        every {
            anyConstructed<CommonPushNotificationPermission>().hasRequiredPermission
        } returns true
        assertTrue(PushNotificationPermission(context).hasRequiredPermission)

        every {
            anyConstructed<CommonPushNotificationPermission>().hasRequiredPermission
        } returns false
        assertFalse(PushNotificationPermission(context).hasRequiredPermission)
    }

    @Test
    fun `requests permission`() = runTest {
        coEvery {
            anyConstructed<CommonPushNotificationPermission>().requestPermission()
        } returns PermissionRequestResult.Granted
        assertTrue(PushNotificationPermission(context).requestPermission())

        coEvery {
            anyConstructed<CommonPushNotificationPermission>().requestPermission()
        } returns PermissionRequestResult.NotGranted(
            true
        )
        assertFalse(PushNotificationPermission(context).requestPermission())
    }

    @Test
    fun `shows notification if enabled`() {
        PushNotificationUtils(context).showNotification(getTestPayload())
        verify {
            anyConstructed<PushNotificationsUtils>().showNotification(
                TestConst.RANDOM_INT,
                any(),
                PushNotificationLaunchActivity::class.java
            )
        }
    }

    @Test
    fun `does not show notification if not enabled`() {
        every { anyConstructed<PushNotificationsUtils>().areNotificationsEnabled() } returns false
        PushNotificationUtils(context).showNotification(getTestPayload())
        verify(exactly = 0) {
            anyConstructed<PushNotificationsUtils>().showNotification(
                any(), any(), any()
            )
        }
    }

    @Test
    fun `does not show notification if explicitly silent`() {
        PushNotificationUtils(context).showNotification(
            getTestPayload(
                mapOf(
                    PushNotificationsConstants.PINPOINT_NOTIFICATION_SILENTPUSH to "1"
                )
            )
        )
        verify(exactly = 0) {
            anyConstructed<PushNotificationsUtils>().showNotification(
                any(), any(), any()
            )
        }
    }

    @Test
    fun `builds a notificationId based on campaign attributes`() {
        PushNotificationUtils(context).showNotification(
            getTestPayload(
                mapOf(
                    PushNotificationsConstants.PINPOINT_CAMPAIGN_CAMPAIGN_ID to TestConst.CAMPAIGN_ID,
                    PushNotificationsConstants.PINPOINT_CAMPAIGN_CAMPAIGN_ACTIVITY_ID to TestConst.CAMPAIGN_ACTIVITY_ID
                )
            )
        )
        verify {
            anyConstructed<PushNotificationsUtils>().showNotification(
                "${TestConst.CAMPAIGN_ID}:${TestConst.CAMPAIGN_ACTIVITY_ID}".hashCode(),
                any(),
                any()
            )
        }
    }

    @Test
    fun `builds a notificationId based on journey attributes`() {
        PushNotificationUtils(context).showNotification(
            getTestPayload(
                mapOf(
                    PushNotificationsConstants.PINPOINT_PREFIX to Json.encodeToString(
                        mapOf(
                            PushNotificationsConstants.JOURNEY to mapOf(
                                PushNotificationsConstants.JOURNEY_ID to TestConst.JOURNEY_ID,
                                PushNotificationsConstants.JOURNEY_ACTIVITY_ID to TestConst.JOURNEY_ACTIVITY_ID
                            )
                        )
                    )
                )
            )
        )
        verify {
            anyConstructed<PushNotificationsUtils>().showNotification(
                "${TestConst.JOURNEY_ID}:${TestConst.JOURNEY_ACTIVITY_ID}".hashCode(), any(), any()
            )
        }
    }

    @Test
    fun `builds a random notificationId if only campaign id is present`() {
        PushNotificationUtils(context).showNotification(
            getTestPayload(
                mapOf(
                    PushNotificationsConstants.PINPOINT_CAMPAIGN_CAMPAIGN_ID to TestConst.CAMPAIGN_ID
                )
            )
        )
        verify {
            anyConstructed<PushNotificationsUtils>().showNotification(
                TestConst.RANDOM_INT, any(), any()
            )
        }
    }

    @Test
    fun `returns if app is in foreground`() {
        every { anyConstructed<PushNotificationsUtils>().isAppInForeground() } returns true
        assertTrue(PushNotificationUtils(context).isAppInForeground())
        every { anyConstructed<PushNotificationsUtils>().isAppInForeground() } returns false
        assertFalse(PushNotificationUtils(context).isAppInForeground())
    }

    @Test
    fun `can create a payload from bundle`() {
        val bundle = Bundle().apply {
            putString(PushNotificationsConstants.PINPOINT_NOTIFICATION_TITLE, TestConst.TITLE)
            putString(PushNotificationsConstants.PINPOINT_NOTIFICATION_BODY, TestConst.BODY)
        }
        val payload = bundle.getNotificationPayload()
        assertEquals(
            TestConst.TITLE,
            payload?.rawData?.get(PushNotificationsConstants.PINPOINT_NOTIFICATION_TITLE)
        )
        assertEquals(
            TestConst.BODY,
            payload?.rawData?.get(PushNotificationsConstants.PINPOINT_NOTIFICATION_BODY)
        )
    }

    @Test
    fun `can create a writable map from payload`() {
        val payload = NotificationPayload.Builder(
            NotificationContentProvider.FCM(
                mapOf(
                    PushNotificationsConstants.PINPOINT_NOTIFICATION_TITLE to TestConst.TITLE,
                    PushNotificationsConstants.PINPOINT_NOTIFICATION_BODY to TestConst.BODY,
                    PushNotificationsConstants.PINPOINT_NOTIFICATION_IMAGEURL to TestConst.IMAGE_URL,
                    TestConst.ADHOC_KEY to TestConst.ADHOC_VAL
                )
            )
        ).build()
        payload.toWritableMap()
        verify {
            mockMap.putString("title", TestConst.TITLE)
            mockMap.putString("body", TestConst.BODY)
            mockMap.putString("imageUrl", TestConst.IMAGE_URL)
            mockMap.putString(
                "channelId",
                PushNotificationsConstants.DEFAULT_NOTIFICATION_CHANNEL_ID
            )
            mockMap.putString(TestConst.ADHOC_KEY, TestConst.ADHOC_VAL)
        }
    }

    @Test
    fun `writable map from payload can contain url action`() {
        val payload = NotificationPayload.Builder(
            NotificationContentProvider.FCM(mapOf(PushNotificationsConstants.PINPOINT_URL to TestConst.URL))
        ).build()
        payload.toWritableMap()
        verify {
            mockMap.putString(PushNotificationsConstants.URL, TestConst.URL)
            mockMap.putMap("action", mockMap)
        }
    }

    @Test
    fun `writable map from payload can contain deeplink action`() {
        val payload = NotificationPayload.Builder(
            NotificationContentProvider.FCM(mapOf(PushNotificationsConstants.PINPOINT_DEEPLINK to TestConst.DEEPLINK_URL))
        ).build()
        payload.toWritableMap()
        verify {
            mockMap.putString(
                PushNotificationsConstants.PINPOINT_DEEPLINK,
                TestConst.DEEPLINK_URL
            )
            mockMap.putMap("action", mockMap)
        }
    }

    @Test
    fun `writable map from payload always has rawData`() {
        val payload = NotificationPayload.Builder(
            NotificationContentProvider.FCM(emptyMap())
        ).build()
        payload.toWritableMap()
        verify(exactly = 0) {
            mockMap.putString(any(), any())
            mockMap.putMap("action", any())
        }
        verify { mockMap.putMap("rawData", mockMap) }
    }

    @Test
    fun `processes payload`() {
        val payload = getTestPayload()
        assertNotNull(payload.getProcessedIntent(context))
    }

    @Test
    fun `adds url action and starts launch activity`() {
        val payload =
            getTestPayload(mapOf(PushNotificationsConstants.PINPOINT_URL to TestConst.URL))
        val intent = payload.getProcessedIntent(context)
        assertEquals(Intent.ACTION_VIEW, intent?.action)
        assertEquals(TestConst.URL, intent?.data.toString())
    }

    @Test
    fun `adds deeplink action and starts launch activity`() {
        val payload =
            getTestPayload(mapOf(PushNotificationsConstants.PINPOINT_DEEPLINK to TestConst.DEEPLINK_URL))
        val intent = payload.getProcessedIntent(context)
        assertEquals(Intent.ACTION_VIEW, intent?.action)
        assertEquals(TestConst.DEEPLINK_URL, intent?.data.toString())
    }
}
