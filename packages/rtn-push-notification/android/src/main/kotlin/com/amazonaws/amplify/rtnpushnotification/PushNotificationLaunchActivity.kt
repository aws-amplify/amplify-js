package com.amazonaws.amplify.rtnpushnotification

import android.app.Activity
import android.content.ActivityNotFoundException
import android.os.Bundle
import android.util.Log
import com.amplifyframework.annotations.InternalAmplifyApi
import com.amplifyframework.notifications.pushnotifications.NotificationPayload

private val TAG = PushNotificationLaunchActivity::class.java.simpleName

class PushNotificationLaunchActivity : Activity() {
    @Override
    @InternalAmplifyApi
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val payload = NotificationPayload.fromIntent(intent)
        val notificationIntent = payload.getProcessedIntent(applicationContext)
        notificationIntent?.putExtras(intent)
        try {
            startActivity(notificationIntent)
        } catch (e: ActivityNotFoundException) {
            Log.e(TAG, "Unable to launch intent.", e)
        }
        finish()
    }
}
