package com.amazonaws.amplify.rtnpushnotification

import android.app.Activity
import android.content.ActivityNotFoundException
import android.os.Bundle
import android.util.Log

private val TAG = PushNotificationLaunchActivity::class.java.simpleName

class PushNotificationLaunchActivity : Activity() {
    @Override
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val payload = getPayloadFromExtras(intent?.extras)
        val notificationIntent = processNotificationIntent(applicationContext, payload)
        notificationIntent?.putExtras(intent)
        try {
            startActivity(notificationIntent)
        } catch (e: ActivityNotFoundException) {
            Log.e(TAG, "Unable to launch intent.", e)
        }
        finish()
    }
}
