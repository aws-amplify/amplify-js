// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

#import <React/RCTEventEmitter.h>
#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(AmplifyRTNPushNotification, RCTEventEmitter)

RCT_EXTERN_METHOD(requestPermissions:(NSDictionary*)permissions
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(getPermissionStatus:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(getLaunchNotification:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(setBadgeCount:(int)count)

RCT_EXTERN_METHOD(getBadgeCount:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(completeNotification:(NSString*)completionHandlerId)

@end
