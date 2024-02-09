// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

@objc(AmplifyRTNCore)
class AmplifyRTNCore: NSObject {
    
    @objc(multiply:withB:withResolver:withRejecter:)
    func multiply(a: Float, b: Float, resolve:RCTPromiseResolveBlock,reject:RCTPromiseRejectBlock) -> Void {
        resolve(a*b)
    }
    
    @objc(computeModPow:withResolver:withRejecter:)
    func computeModPow(
        payload: [String: String],
        resolve: RCTPromiseResolveBlock,
        reject: RCTPromiseRejectBlock
    ) -> Void {
        BigInteger.computeModPow(payload, resolve: resolve, reject: reject)
    }
    
    @objc(computeS:withResolver:withRejecter:)
    func computeS(
        _ payload: [String: String],
        resolve: RCTPromiseResolveBlock,
        reject: RCTPromiseRejectBlock
    ) -> Void {
        BigInteger.computeS(payload, resolve: resolve, reject: reject)
    }
}
