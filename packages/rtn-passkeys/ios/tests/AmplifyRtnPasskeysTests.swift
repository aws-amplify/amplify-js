// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import XCTest

@testable import AmplifyRtnPasskeys

class AmplifyRtnPasskeysTests: XCTestCase {
	private var mockResolve: RCTPromiseResolveBlock!
	private var mockReject: RCTPromiseRejectBlock!

	private var resolveCalled = false
	private var resolveValue: Any?

	private var rejectCalled = false
	private var rejectErrorName: String?
	private var rejectErrorMessage: String?

	override func setUp() {
		super.setUp()

		mockResolve = { value in
			self.resolveCalled = true
			self.resolveValue = value
		}

		mockReject = { errorName, errorMessage, error in
			self.rejectCalled = true
			self.rejectErrorName = errorName
			self.rejectErrorMessage = errorMessage
		}
	}

	override func tearDown() {
		super.tearDown()

		resolveCalled = false
		resolveValue = nil

		rejectCalled = false
		rejectErrorName = nil
		rejectErrorMessage = nil
	}

	func testGetPasskeyShouldRejectWhenNotSupported() {
		class MockAmplifyRtnPasskeys: AmplifyRtnPasskeys {
			override func getIsPasskeySupported() -> NSNumber {
				return false
			}
		}

		let mockInstance = MockAmplifyRtnPasskeys()

		mockInstance.getPasskey(
			TestFixtures.validRpId,
			challenge: TestFixtures.validChallenge,
			userVerification: TestFixtures
				.validUserVerificationRequired,
			allowCredentials: TestFixtures
				.validAllowCredentials, resolve: mockResolve, reject: mockReject)

		XCTAssertTrue(rejectCalled)
		XCTAssertTrue(!resolveCalled)
		XCTAssertEqual(rejectErrorName, "NOT_SUPPORTED")
		XCTAssertEqual(rejectErrorMessage, nil)
	}

	func testCreatePasskeyShouldRejectWhenNotSupported() {
		class MockAmplifyRtnPasskeys: AmplifyRtnPasskeys {
			override func getIsPasskeySupported() -> NSNumber {
				return false
			}
		}

		let mockInstance = MockAmplifyRtnPasskeys()

		mockInstance.createPasskey(
			TestFixtures.validRpId,
			userId: TestFixtures.validUserId,
			userName: TestFixtures.validUserName,
			challenge: TestFixtures.validChallenge,
			excludeCredentials: TestFixtures
				.validExcludeCredentials, resolve: mockResolve, reject: mockReject)

		XCTAssertTrue(rejectCalled)
		XCTAssertTrue(!resolveCalled)
		XCTAssertEqual(rejectErrorName, "NOT_SUPPORTED")
		XCTAssertEqual(rejectErrorMessage, nil)
	}

	func testGetPasskeyShouldResolveWithAssertionResultFromDelegate() {
		class MockAmplifyRtnPasskeys: AmplifyRtnPasskeys {
			override func getIsPasskeySupported() -> NSNumber {
				return true
			}
			override func initializePasskeyDelegate(
				resultHandler: any AmplifyRtnPasskeysResultHandler
			) -> AmplifyRtnPasskeysDelegate {
				class MockAmplifyRtnPasskeysDelegate: AmplifyRtnPasskeysDelegate {
					override func performAuthForController(
						_ authController: ASAuthorizationController
					) {
						self._resultHandler.handleSuccess(TestFixtures.getPasskeySuccess())
					}
				}
				return MockAmplifyRtnPasskeysDelegate(resultHandler: self)
			}
		}

		let mockInstance = MockAmplifyRtnPasskeys()

		mockInstance.getPasskey(
			TestFixtures.validRpId,
			challenge: TestFixtures.validChallenge,
			userVerification: TestFixtures
				.validUserVerificationRequired,
			allowCredentials: TestFixtures
				.validAllowCredentials, resolve: mockResolve, reject: mockReject)

		XCTAssertTrue(resolveCalled)
		XCTAssertTrue(!rejectCalled)
		XCTAssertEqual(
			resolveValue as! NSDictionary, TestFixtures.getPasskeySuccess())

	}

	func testCreatePasskeyShouldResolveWithRegistrationResultFromDelegate() {
		class MockAmplifyRtnPasskeys: AmplifyRtnPasskeys {
			override func getIsPasskeySupported() -> NSNumber {
				return true
			}
			override func initializePasskeyDelegate(
				resultHandler: any AmplifyRtnPasskeysResultHandler
			) -> AmplifyRtnPasskeysDelegate {
				class MockAmplifyRtnPasskeysDelegate: AmplifyRtnPasskeysDelegate {
					override func performAuthForController(
						_ authController: ASAuthorizationController
					) {
						self._resultHandler.handleSuccess(
							TestFixtures.createPasskeySuccess())
					}
				}
				return MockAmplifyRtnPasskeysDelegate(resultHandler: self)
			}
		}

		let mockInstance = MockAmplifyRtnPasskeys()

		mockInstance.createPasskey(
			TestFixtures.validRpId,
			userId: TestFixtures.validUserId,
			userName: TestFixtures.validUserName,
			challenge: TestFixtures.validChallenge,
			excludeCredentials: TestFixtures
				.validExcludeCredentials, resolve: mockResolve, reject: mockReject)

		XCTAssertTrue(resolveCalled)
		XCTAssertTrue(!rejectCalled)
		XCTAssertEqual(
			resolveValue as! NSDictionary, TestFixtures.createPasskeySuccess())
	}

	func testGetPasskeyShouldRejectWithErrorFromDelegate() {
		class MockAmplifyRtnPasskeys: AmplifyRtnPasskeys {
			override func getIsPasskeySupported() -> NSNumber {
				return true
			}
			override func initializePasskeyDelegate(
				resultHandler: any AmplifyRtnPasskeysResultHandler
			) -> AmplifyRtnPasskeysDelegate {
				class MockAmplifyRtnPasskeysDelegate: AmplifyRtnPasskeysDelegate {
					override func performAuthForController(
						_ authController: ASAuthorizationController
					) {
						self._resultHandler.handleError(
							errorName: "SOME_ERROR", errorMessage: "some error message",
							error: nil)
					}
				}
				return MockAmplifyRtnPasskeysDelegate(resultHandler: self)
			}
		}

		let mockInstance = MockAmplifyRtnPasskeys()

		mockInstance.getPasskey(
			TestFixtures.validRpId,
			challenge: TestFixtures.validChallenge,
			userVerification: TestFixtures
				.validUserVerificationRequired,
			allowCredentials: TestFixtures
				.validAllowCredentials, resolve: mockResolve, reject: mockReject)

		XCTAssertTrue(rejectCalled)
		XCTAssertTrue(!resolveCalled)
		XCTAssertEqual(rejectErrorName, "SOME_ERROR")
		XCTAssertEqual(rejectErrorMessage, "some error message")
	}

	func testCreatePasskeyShouldRejectWithErrorFromDelegate() {
		class MockAmplifyRtnPasskeys: AmplifyRtnPasskeys {
			override func getIsPasskeySupported() -> NSNumber {
				return true
			}
			override func initializePasskeyDelegate(
				resultHandler: any AmplifyRtnPasskeysResultHandler
			) -> AmplifyRtnPasskeysDelegate {
				class MockAmplifyRtnPasskeysDelegate: AmplifyRtnPasskeysDelegate {
					override func performAuthForController(
						_ authController: ASAuthorizationController
					) {
						self._resultHandler.handleError(
							errorName: "SOME_ERROR", errorMessage: "some error message",
							error: nil)
					}
				}
				return MockAmplifyRtnPasskeysDelegate(resultHandler: self)
			}
		}

		let mockInstance = MockAmplifyRtnPasskeys()

		mockInstance.createPasskey(
			TestFixtures.validRpId,
			userId: TestFixtures.validUserId,
			userName: TestFixtures.validUserName,
			challenge: TestFixtures.validChallenge,
			excludeCredentials: TestFixtures
				.validExcludeCredentials, resolve: mockResolve, reject: mockReject)

		XCTAssertTrue(rejectCalled)
		XCTAssertTrue(!resolveCalled)
		XCTAssertEqual(rejectErrorName, "SOME_ERROR")
		XCTAssertEqual(rejectErrorMessage, "some error message")
	}
}
