// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

extension String {
	// Converts base64Url encoded string to base64 Data
	func toBase64UrlDecodedData() -> Data {
		var base64String = self.replacingOccurrences(of: "_", with: "/")
			.replacingOccurrences(of: "-", with: "+")

		while base64String.count % 4 != 0 {
			base64String.append("=")
		}

		return Data(base64Encoded: base64String) ?? Data()
	}
}

extension Data {
	// Converts base64 Data to base64url String
	func toBase64UrlEncodedString() -> String {
		return self.base64EncodedString()
			.replacingOccurrences(of: "/", with: "_")
			.replacingOccurrences(of: "+", with: "-")
			.replacingOccurrences(of: "=", with: "")
	}
}

struct AmplifyRtnPasskeysPromiseHandler {
	let resolve: RCTPromiseResolveBlock
	let reject: RCTPromiseRejectBlock

	init(
		_ resolve: @escaping RCTPromiseResolveBlock,
		_ reject: @escaping RCTPromiseRejectBlock
	) {
		self.resolve = resolve
		self.reject = reject
	}
}

protocol AmplifyRtnPasskeysResultHandler {
	func handleSuccess(_ data: NSDictionary)
	func handleError(
		errorName: String, errorMessage: String?, error: (any Error)?)
}
