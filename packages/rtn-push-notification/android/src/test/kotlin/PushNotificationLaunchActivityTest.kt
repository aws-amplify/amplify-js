// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import android.content.Intent
import com.amazonaws.amplify.rtnpushnotification.PushNotificationLaunchActivity
import com.amazonaws.amplify.rtnpushnotification.getProcessedIntent
import com.amplifyframework.annotations.InternalAmplifyApi
import com.amplifyframework.notifications.pushnotifications.NotificationPayload
import io.mockk.*
import org.junit.Assert.assertEquals
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.Robolectric.buildActivity
import org.robolectric.RobolectricTestRunner
import org.robolectric.Shadows.shadowOf

@InternalAmplifyApi
@RunWith(RobolectricTestRunner::class)
class PushNotificationLaunchActivityTest {
    private object TestConst {
        const val EXTRAS_KEY = "foo"
        const val EXTRAS_VAL = "bar"
    }

    @Before
    fun setup() {
        mockkStatic(NotificationPayload::getProcessedIntent)
        every { any<NotificationPayload>().getProcessedIntent(any()) } returns Intent()
    }

    @Test
    fun `adds launch intent with extras and starts launch activity`() {
        val intent = Intent().apply {
            putExtra(TestConst.EXTRAS_KEY, TestConst.EXTRAS_VAL)
        }
        buildActivity(PushNotificationLaunchActivity::class.java, intent).use {
            val activity = it.setup().get()
            val notificationIntent = shadowOf(activity).nextStartedActivity

            assertEquals(TestConst.EXTRAS_VAL, notificationIntent.extras?.get(TestConst.EXTRAS_KEY))
            it.pause().stop().destroy()
        }
    }
}
