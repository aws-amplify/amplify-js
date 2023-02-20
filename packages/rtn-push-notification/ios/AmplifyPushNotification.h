// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

#ifndef AmplifyPushNotification_h
#define AmplifyPushNotification_h

#import <Foundation/Foundation.h>

@interface AmplifyPushNotification : NSObject

+ (void) didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken;
+ (void) didFailToRegisterForRemoteNotificationsWithError:(NSError*)error;
+ (void) didReceiveRemoteNotification:(NSDictionary *)userInfo withCompletionHandler:(void (^)(UIBackgroundFetchResult))completionHandler;

@end

#endif
