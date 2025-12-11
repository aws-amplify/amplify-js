// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

#import "AmplifyRtnAsf.h"
#import "AmplifyRtnAsf-Swift.h"

@implementation AmplifyRtnAsf

- (NSString *)getContextData:(NSString *)userPoolId clientId:(NSString *)clientId {
    return [[AmplifyRtnAsfSwift alloc] getContextData:userPoolId clientId:clientId];
}

+ (NSString *)moduleName {
    return @"AmplifyRtnAsf";
}

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params {
    return std::make_shared<facebook::react::NativeAmplifyRtnAsfSpecJSI>(params);
}

@end
