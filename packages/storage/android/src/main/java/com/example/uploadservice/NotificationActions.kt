package com.example.uploadservice

import android.app.PendingIntent
import android.content.Context
import android.content.Intent

class NotificationActions {
    var INTENT_ACTION = "com.vydia.RNUploader.notification.action"

    val PARAM_ACTION = "action"
    val PARAM_UPLOAD_ID = "uploadId"

    val ACTION_CANCEL_UPLOAD = "cancelUpload"


    fun getCancelUploadAction(context: Context?,
                              requestCode: Int,
                              uploadID: String?): PendingIntent? {
        val intent = Intent(INTENT_ACTION)
        intent.putExtra(PARAM_ACTION, ACTION_CANCEL_UPLOAD)
        intent.putExtra(PARAM_UPLOAD_ID, uploadID)
        return PendingIntent.getBroadcast(context, requestCode, intent, PendingIntent.FLAG_UPDATE_CURRENT)
    }
}
