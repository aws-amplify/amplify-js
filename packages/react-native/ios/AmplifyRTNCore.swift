// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

#if canImport(UIKit)
	import UIKit
#else
	import Foundation	
#endif

@objc(AmplifyRTNCore)
class AmplifyRTNCore: NSObject {
	@objc(multiply:withB:withResolver:withRejecter:)
	func multiply(a: Float, b: Float, resolve: RCTPromiseResolveBlock, reject _: RCTPromiseRejectBlock) {
		resolve(a * b)
	}

	@objc(computeModPow:withResolver:withRejecter:)
	func computeModPow(
		payload: [String: String],
		resolve: RCTPromiseResolveBlock,
		reject: RCTPromiseRejectBlock
	) {
		BigInteger.computeModPow(payload, resolve: resolve, reject: reject)
	}

	@objc(computeS:withResolver:withRejecter:)
	func computeS(
		_ payload: [String: String],
		resolve: RCTPromiseResolveBlock,
		reject: RCTPromiseRejectBlock
	) {
		BigInteger.computeS(payload, resolve: resolve, reject: reject)
	}

	@objc(getDeviceName:withResolver:)
	func getDeviceName(resolve: @escaping RCTPromiseResolveBlock, reject _: @escaping RCTPromiseRejectBlock) {
		var deviceName: String
		#if canImport(UIKit)
			deviceName = UIDevice.current.name
		#else
			deviceName = ProcessInfo.processInfo.hostName
		#endif
		resolve(deviceName)
	}
}
