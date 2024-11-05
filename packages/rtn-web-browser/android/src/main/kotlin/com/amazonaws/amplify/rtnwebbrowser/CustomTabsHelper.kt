package com.amazonaws.amplify.rtnwebbrowser

import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import androidx.browser.customtabs.CustomTabsService

private const val DUMMY_URL = "http://www.example.com"

internal object CustomTabsHelper {
    private var customTabsPackage: String? = null

    fun getCustomTabsPackageName(context: Context): String? {
        customTabsPackage?.let { return customTabsPackage }
        val packageManager = context.packageManager
        val activityIntent = Intent(Intent.ACTION_VIEW, Uri.parse(DUMMY_URL))
        // Get default VIEW intent handler
        val defaultViewHandlerPackage = packageManager.resolveActivity(
            activityIntent,
            PackageManager.MATCH_DEFAULT_ONLY
        )?.activityInfo?.packageName ?: ""

        // Get all apps that can handle VIEW intents
        val resolvedActivityList =
            packageManager.queryIntentActivities(activityIntent, PackageManager.MATCH_ALL)

        // Get all apps that can handle both VIEW intents and service calls
        val packagesSupportingCustomTabs = ArrayList<String>()
        resolvedActivityList.forEach { resolveInfo ->
            val serviceIntent = Intent()
                .setAction(CustomTabsService.ACTION_CUSTOM_TABS_CONNECTION)
                .setPackage(resolveInfo.activityInfo.packageName)
            packageManager.resolveService(serviceIntent, PackageManager.MATCH_ALL)?.let {
                packagesSupportingCustomTabs.add(it.serviceInfo.packageName)
            }
        }

        customTabsPackage = if (packagesSupportingCustomTabs.isEmpty()) {
            // If no packages support custom tabs, return null
            null
        } else if (defaultViewHandlerPackage.isNotEmpty() && packagesSupportingCustomTabs.contains(
                defaultViewHandlerPackage
            )
        ) {
            // Prefer the default browser if it supports Custom Tabs
            defaultViewHandlerPackage
        } else {
            // Otherwise, pick the next favorite Custom Tabs provider
            packagesSupportingCustomTabs[0]
        }
        return customTabsPackage
    }
}
