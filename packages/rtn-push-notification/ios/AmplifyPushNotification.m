// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

#import "AmplifyRTNPushNotification-Swift.h"
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

+ (NSDictionary*) attachInitialProps:(NSDictionary*)launchOptions {
    return [AmplifyPushNotificationAppDelegateHelper attachInitialPropsWithLaunchOptions:launchOptions];
}

@end
