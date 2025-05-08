// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import AuthenticationServices
import Foundation

@objc(AmplifyRtnPasskeysHelper)
public class AmplifyRtnPasskeysHelper: NSObject, AmplifyRtnPasskeysResultHandler
{
	private var delegate: AmplifyRtnPasskeysDelegate?
	private var handler: AmplifyRtnPasskeysHandler?

	@objc
	@available(iOS 17.4, *)
	public func createPasskey(
		_ input: NSMutableDictionary,
		resolve: @escaping RCTPromiseResolveBlock,
		reject: @escaping RCTPromiseRejectBlock
	) {

		handler = AmplifyRtnPasskeysHandler(resolve, reject)

		guard let rpId = input["rp"] as? [String: Any],
			let rpIdString = rpId["id"] as? String,
			let challenge = input["challenge"] as? String,
			let user = input["user"] as? [String: Any],
			let userName = user["name"] as? String,
			let userId = user["id"] as? String
		else {
			handleError(errorName: "FAILED")
			return
		}

		let platformProvider = ASAuthorizationPlatformPublicKeyCredentialProvider(
			relyingPartyIdentifier: rpIdString)

		let platformKeyRequest =
			platformProvider.createCredentialRegistrationRequest(
				challenge: challenge.toBase64UrlDecodedData(),
				name: userName,
				userID: userId.toBase64UrlDecodedData()
			)

		var excludedCredentials:
			[ASAuthorizationPlatformPublicKeyCredentialDescriptor] = []

		if let excludeCredentialsArray = input["excludeCredentials"]
			as? [[String: Any]]
		{
			for credential in excludeCredentialsArray {
				if let credentialId = credential["id"] as? String {
					let pkcDescriptor =
						ASAuthorizationPlatformPublicKeyCredentialDescriptor(
							credentialID:
								credentialId.toBase64UrlDecodedData()
						)
					excludedCredentials.append(pkcDescriptor)
				}
			}
		}

		platformKeyRequest.excludedCredentials = excludedCredentials

		let authController = ASAuthorizationController(authorizationRequests: [
			platformKeyRequest
		])

		delegate = AmplifyRtnPasskeysDelegate(handler: self)

		authController.delegate = delegate
		authController.presentationContextProvider = delegate
		authController.performRequests()
	}

	@objc
	@available(iOS 17.4, *)
	public func getPasskey(
		_ input: NSDictionary,
		resolve: @escaping RCTPromiseResolveBlock,
		reject: @escaping RCTPromiseRejectBlock
	) {

		handler = AmplifyRtnPasskeysHandler(resolve, reject)

		guard let rpId = input["rpId"] as? String,
			let challenge = input["challenge"] as? String
		else {
			handleError(errorName: "FAILED")
			return
		}

		let platformProvider = ASAuthorizationPlatformPublicKeyCredentialProvider(
			relyingPartyIdentifier: rpId)

		let platformKeyRequest = platformProvider.createCredentialAssertionRequest(
			challenge: challenge.toBase64UrlDecodedData()
		)

		var allowedCredentials:
			[ASAuthorizationPlatformPublicKeyCredentialDescriptor] = []

		if let allowCredentialsArray = input["allowCredentials"]
			as? [[String: Any]]
		{
			for credential in allowCredentialsArray {
				if let credentialId = credential["id"] as? String {
					let pkcDescriptor =
						ASAuthorizationPlatformPublicKeyCredentialDescriptor(
							credentialID: credentialId.toBase64UrlDecodedData()
						)
					allowedCredentials.append(pkcDescriptor)
				}
			}
		}

		platformKeyRequest.allowedCredentials = allowedCredentials

		if let userVerification = input["userVerification"] as? String {
			platformKeyRequest.userVerificationPreference =
				ASAuthorizationPublicKeyCredentialUserVerificationPreference(
					userVerification)
		}

		let authController = ASAuthorizationController(authorizationRequests: [
			platformKeyRequest
		])

		delegate = AmplifyRtnPasskeysDelegate(handler: self)

		authController.delegate = delegate
		authController.presentationContextProvider = delegate
		authController.performRequests()
	}

	func handleSuccess(_ data: NSDictionary) {
		guard let _handler = handler else {
			return
		}
		_handler.resolve(data)
		handler = nil
		delegate = nil
	}

	func handleError(
		errorName: String, errorMessage: String? = nil, error: (any Error)? = nil
	) {
		guard let _handler = handler else {
			return
		}
		_handler.reject(errorName, errorMessage, error)
		handler = nil
		delegate = nil
	}

	// MARK: - AmplifyRtnPasskeys.getIsPasskeySupported
	@objc
	public static func getIsPasskeySupported() -> NSNumber {
		if #available(iOS 17.4, *) {
			return true
		}
		return false
	}
}

// MARK: - String Extension
extension String {
	fileprivate func toBase64UrlDecodedData() -> Data {
		var base64String = self.replacingOccurrences(of: "_", with: "/")
			.replacingOccurrences(of: "-", with: "+")

		let padLength = 4 - (base64String.count % 4)

		if padLength < 4 {
			base64String.append(
				String(repeating: "=", count: 4 - (base64String.count % 4)))
		}

		return Data(base64Encoded: base64String) ?? Data()
	}
}

// MARK: - AmplifyRtnPasskeysHandler
struct AmplifyRtnPasskeysHandler {
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

// MARK: - ResultHandlerProtocol
protocol AmplifyRtnPasskeysResultHandler {
	func handleSuccess(_ data: NSDictionary)
	func handleError(
		errorName: String, errorMessage: String?, error: (any Error)?)
}
