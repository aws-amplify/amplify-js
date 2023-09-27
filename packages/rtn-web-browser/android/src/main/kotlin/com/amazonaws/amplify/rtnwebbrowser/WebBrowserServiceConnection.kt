// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

package com.amazonaws.amplify.rtnwebbrowser

import android.content.ComponentName
import android.content.Context
import androidx.browser.customtabs.CustomTabsClient
import androidx.browser.customtabs.CustomTabsServiceConnection
import androidx.browser.customtabs.CustomTabsSession
import com.amazonaws.amplify.rtnwebbrowser.CustomTabsHelper.getCustomTabsPackageName

internal class WebBrowserServiceConnection(
    private val context: Context
) : CustomTabsServiceConnection() {
    private var customTabsPackage: String? = getCustomTabsPackageName(context)
    private var session: CustomTabsSession? = null
    private var client: CustomTabsClient? = null

    init {
        session = client?.newSession(null)
    }

    fun destroy() {
        if (customTabsPackage != null) {
            context.unbindService(this)
        }
        customTabsPackage = null
        client = null
        session = null
    }

    fun getSession(): CustomTabsSession? {
        return session
    }

    override fun onCustomTabsServiceConnected(name: ComponentName, client: CustomTabsClient) {
        if (name.packageName === customTabsPackage) {
            client.warmup(0L)
            session = client.newSession(null)
            this.client = client
        }
    }

    override fun onServiceDisconnected(name: ComponentName) {
        if (name.packageName === customTabsPackage) {
            destroy()
        }
    }
}
