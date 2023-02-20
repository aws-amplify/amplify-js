// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import Foundation

@objc(AmplifyPushNotificationAppDelegateHelper)
public class AmplifyPushNotificationAppDelegateHelper: NSObject {
    @objc
    static public func didRegisterForRemoteNotificationsWithDeviceToken(_ deviceToken: Data) {
        AmplifyRTNPushNotificationManager
            .shared
            .didRegisterForRemoteNotificationsWithDeviceToken(deviceToken: deviceToken)
    }

    @objc
    static public func didFailToRegisterForRemoteNotificationsWithError(_ error: Error) {
        AmplifyRTNPushNotificationManager
            .shared
            .didFailToRegisterForRemoteNotificationsWithError(error: error)
    }

    @objc
    static public func didReceiveRemoteNotification(
        userInfo: [AnyHashable: Any],
        completionHandler: @escaping (UIBackgroundFetchResult) -> Void
    ) {
        AmplifyRTNPushNotificationManager
            .shared
            .didReceiveRemoteNotification(userInfo: userInfo, completionHandler: completionHandler)
    }
}
