// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(AmplifyRTNWebBrowser, NSObject)

RCT_EXTERN_METHOD(openAuthSessionAsync:(NSString*)url
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

@end
