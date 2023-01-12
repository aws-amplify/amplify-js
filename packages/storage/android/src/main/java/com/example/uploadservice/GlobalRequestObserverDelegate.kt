package com.example.uploadservice

import android.content.Context
import android.util.Log
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.WritableMap
import com.facebook.react.modules.core.DeviceEventManagerModule.RCTDeviceEventEmitter
import net.gotev.uploadservice.data.UploadInfo
import net.gotev.uploadservice.network.ServerResponse
import net.gotev.uploadservice.observer.request.RequestObserverDelegate

class GlobalRequestObserverDelegate(reactContext: ReactApplicationContext) : RequestObserverDelegate {
    private val TAG = "UploadReceiver"

    private var reactContext: ReactApplicationContext = reactContext

    override fun onCompleted(context: Context, uploadInfo: UploadInfo) {
    }

    override fun onCompletedWhileNotObserving() {
    }

    override fun onError(context: Context, uploadInfo: UploadInfo, exception: Throwable) {
        val params = Arguments.createMap()
        params.putString("id", uploadInfo.uploadId)

        // Make sure we do not try to call getMessage() on a null object
        if (exception != null) {
            params.putString("error", exception.message)
        } else {
            params.putString("error", "Unknown exception")
        }

        sendEvent("error", params, context)
    }

    override fun onProgress(context: Context, uploadInfo: UploadInfo) {
        val params = Arguments.createMap()
        params.putString("id", uploadInfo.uploadId)
        params.putInt("progress", uploadInfo.progressPercent) //0-100

        sendEvent("progress", params, context)
    }

    override fun onSuccess(context: Context, uploadInfo: UploadInfo, serverResponse: ServerResponse) {
        val headers = Arguments.createMap()
        for ((key, value) in serverResponse.headers) {
            headers.putString(key, value)
        }
        val params = Arguments.createMap()
        params.putString("id", uploadInfo.uploadId)
        params.putInt("responseCode", serverResponse.code)
        params.putString("responseBody", serverResponse.bodyString)
        params.putMap("responseHeaders", headers)
        sendEvent("completed", params, context)
    }

    /**
     * Sends an event to the JS module.
     */
    private fun sendEvent(eventName: String, params: WritableMap?, context: Context) {
        reactContext?.getJSModule(RCTDeviceEventEmitter::class.java)?.emit("RNFileUploader-$eventName", params)
            ?: Log.e(TAG, "sendEvent() failed due reactContext == null!")
    }
}