// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

#if __has_include ("AmplifyRTNPushNotification/AmplifyRTNPushNotification-Swift.h")
#import "AmplifyRTNPushNotification/AmplifyRTNPushNotification-Swift.h"
#else
#import "AmplifyRTNPushNotification-Swift.h"
#endif
#import "AmplifyPushNotification.h"

@implementation AmplifyPushNotification

+ (void) didRegisterForRemoteNotificationsWithDeviceToken:(NSData*)deviceToken {
    [AmplifyPushNotificationAppDelegateHelper didRegisterForRemoteNotificationsWithDeviceToken:deviceToken];
}

+ (void) didFailToRegisterForRemoteNotificationsWithError:(NSError*)error {
    [AmplifyPushNotificationAppDelegateHelper didFailToRegisterForRemoteNotificationsWithError:error];
}

+ (void) didReceiveRemoteNotification:(NSDictionary*)userInfo withCompletionHandler:(void (^)(UIBackgroundFetchResult))completionHandler {
    [AmplifyPushNotificationAppDelegateHelper didReceiveRemoteNotificationWithUserInfo:userInfo completionHandler:completionHandler];
}

@end
