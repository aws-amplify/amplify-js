// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import XCTest

@testable import AmplifyRtnPasskeys

class AmplifyRtnPasskeysHelpersTests: XCTestCase {
	
	override func setUp() {
		super.setUp()
	}

	override func tearDown() {
		super.tearDown()
	}

	func testToBase64UrlDecodedData() {
		XCTAssertEqual(
			TestFixtures.base64UrlString.toBase64UrlDecodedData(),
			Data(base64Encoded: TestFixtures.base64String),
			"Base64Url decoding should work correctly")
	}

	func testToBase64UrlEncodedString() {
		XCTAssertEqual(
			Data(base64Encoded: TestFixtures.base64String)?.toBase64UrlEncodedString(),
			TestFixtures.base64UrlString,
			"Base64Url encoding should work correctly")
	}

	func testBase64UrlTranscodeRoundTrip() {
		XCTAssertEqual(
			TestFixtures.base64UrlString,
			TestFixtures.base64UrlString.toBase64UrlDecodedData().toBase64UrlEncodedString(),
			"Base64Url encoding and decoding should work correctly")
	}



}
