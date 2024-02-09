// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

package com.amazonaws.amplify.rtnwebbrowser

import android.annotation.SuppressLint
import android.content.Intent
import android.net.Uri
import android.util.Patterns
import androidx.browser.customtabs.CustomTabsClient
import androidx.browser.customtabs.CustomTabsIntent
import com.amazonaws.amplify.rtnwebbrowser.CustomTabsHelper.getCustomTabsPackageName
import com.facebook.react.bridge.LifecycleEventListener
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import java.lang.Exception


private val TAG = WebBrowserModule::class.java.simpleName

class WebBrowserModule(
    reactContext: ReactApplicationContext,
) : ReactContextBaseJavaModule(reactContext), LifecycleEventListener {

    private var connection: WebBrowserServiceConnection? = null

    init {
        reactContext.addLifecycleEventListener(this)
        getCustomTabsPackageName(reactApplicationContext)?.let {
            connection = WebBrowserServiceConnection(reactApplicationContext)
            CustomTabsClient.bindCustomTabsService(reactApplicationContext, it, connection!!)
        }
    }

    @ReactMethod
    fun openAuthSessionAsync(uriStr: String, promise: Promise) {
        if (!Patterns.WEB_URL.matcher(uriStr).matches()) {
            promise.reject(Throwable("Provided url is invalid"))
            return
        }
        try {
            getCustomTabsPackageName(reactApplicationContext)?.let {
                val customTabsIntent = CustomTabsIntent.Builder(connection?.getSession()).build()
                customTabsIntent.intent.setPackage(it).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                customTabsIntent.launchUrl(reactApplicationContext, Uri.parse(uriStr))
            } ?: run {
                promise.reject(Throwable("No eligible browser found on device"))
            }
        } catch (e: Exception) {
            promise.reject(e)
        }
        promise.resolve(null)
    }

    override fun onHostResume() {
        // noop - only overridden as this class implements LifecycleEventListener
    }

    override fun onHostPause() {
        // noop - only overridden as this class implements LifecycleEventListener
    }

    override fun onHostDestroy() {
        connection?.destroy()
        connection = null
    }


    override fun getName() = "AmplifyRTNWebBrowser"

    override fun getConstants(): MutableMap<String, Any> = hashMapOf()
}
