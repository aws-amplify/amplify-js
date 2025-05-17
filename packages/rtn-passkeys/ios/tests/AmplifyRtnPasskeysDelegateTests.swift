// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import XCTest

@testable import AmplifyRtnPasskeys

class MockASAuthorizationController: ASAuthorizationController {}
class MockASAuthorization: ASAuthorization, @unchecked Sendable {}

class AmplifyRtnPasskeysDelegateTests: XCTestCase,
	AmplifyRtnPasskeysResultHandler
{
	private var mockResolve: RCTPromiseResolveBlock!
	private var mockReject: RCTPromiseRejectBlock!

	override func setUp() {
		super.setUp()
	}

	override func tearDown() {
		super.tearDown()
	}

	func handleSuccess(_ data: NSDictionary) {
		mockResolve(data)
	}

	func handleError(
		errorName: String, errorMessage: String?, error: (any Error)?
	) {
		mockReject(errorName, errorMessage, error)
	}

	func testInitializedWithResultHandler() {
		let passkeyDelegate = AmplifyRtnPasskeysDelegate(resultHandler: self)

		XCTAssertEqual(
			self,
			passkeyDelegate._resultHandler as! AmplifyRtnPasskeysDelegateTests)
	}

}
