// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import AuthenticationServices
import Foundation

@objc(AmplifyRtnPasskeysSwift)
public class AmplifyRtnPasskeys: NSObject, AmplifyRtnPasskeysResultHandler {
	private var _passkeyDelegate: AmplifyRtnPasskeysDelegate?
	private var _promiseHandler: AmplifyRtnPasskeysPromiseHandler?

	@objc
	@available(iOS 15.0, *)
	public func createPasskey(
		_ rpId: String,
		userId: String,
		userName: String,
		challenge: String,
		excludeCredentials: [String],
		resolve: @escaping RCTPromiseResolveBlock,
		reject: @escaping RCTPromiseRejectBlock
	) {

		_promiseHandler = initializePromiseHandler(resolve, reject)

		guard self.getIsPasskeySupported() == true else {
			handleError(errorName: "NOT_SUPPORTED", errorMessage: nil, error: nil)
			return
		}

		let platformProvider = ASAuthorizationPlatformPublicKeyCredentialProvider(
			relyingPartyIdentifier: rpId)

		let platformKeyRequest =
			platformProvider.createCredentialRegistrationRequest(
				challenge: challenge.toBase64UrlDecodedData(),
				name: userName,
				userID: userId.toBase64UrlDecodedData()
			)

		if #available(iOS 17.4, *) {
			let excludedCredentials:
				[ASAuthorizationPlatformPublicKeyCredentialDescriptor] =
					excludeCredentials.compactMap { credentialId in
						return .init(credentialID: credentialId.toBase64UrlDecodedData())
					}

			platformKeyRequest.excludedCredentials = excludedCredentials
		}

		let authController = initializeAuthController(
			platformKeyRequest: platformKeyRequest)

		let passkeyDelegate = initializePasskeyDelegate(resultHandler: self)

		_passkeyDelegate = passkeyDelegate
		
		passkeyDelegate.performAuthForController(authController)
	}

	@objc
	@available(iOS 15.0, *)
	public func getPasskey(
		_ rpId: String,
		challenge: String,
		userVerification: String,
		allowCredentials: [String],
		resolve: @escaping RCTPromiseResolveBlock,
		reject: @escaping RCTPromiseRejectBlock
	) {
		_promiseHandler = initializePromiseHandler(resolve, reject)

		guard self.getIsPasskeySupported() == true else {
			handleError(errorName: "NOT_SUPPORTED")
			return
		}

		let platformProvider = ASAuthorizationPlatformPublicKeyCredentialProvider(
			relyingPartyIdentifier: rpId)

		let platformKeyRequest = platformProvider.createCredentialAssertionRequest(
			challenge: challenge.toBase64UrlDecodedData()
		)

		let allowedCredentials:
			[ASAuthorizationPlatformPublicKeyCredentialDescriptor] =
				allowCredentials.compactMap { credentialId in
					return .init(credentialID: credentialId.toBase64UrlDecodedData())
				}

		platformKeyRequest.allowedCredentials = allowedCredentials

		platformKeyRequest.userVerificationPreference =
			ASAuthorizationPublicKeyCredentialUserVerificationPreference(
				userVerification)

		let authController = initializeAuthController(
			platformKeyRequest: platformKeyRequest)

		let passkeyDelegate = initializePasskeyDelegate(resultHandler: self)
		
		_passkeyDelegate = passkeyDelegate
		
		passkeyDelegate.performAuthForController(authController)
	}

	func handleSuccess(_ data: NSDictionary) {
		guard let handler = _promiseHandler else {
			return
		}
		handler.resolve(data)
		_promiseHandler = nil
		_passkeyDelegate = nil
	}

	func handleError(
		errorName: String, errorMessage: String? = nil, error: (any Error)? = nil
	) {
		guard let handler = _promiseHandler else {
			return
		}
		handler.reject(errorName, errorMessage, error)
		_promiseHandler = nil
		_passkeyDelegate = nil
	}

	func initializePromiseHandler(
		_ resolve: @escaping RCTPromiseResolveBlock,
		_ reject: @escaping RCTPromiseRejectBlock
	) -> AmplifyRtnPasskeysPromiseHandler {
		return AmplifyRtnPasskeysPromiseHandler(resolve, reject)
	}

	func initializePasskeyDelegate(resultHandler: AmplifyRtnPasskeysResultHandler)
		-> AmplifyRtnPasskeysDelegate
	{
		return AmplifyRtnPasskeysDelegate(resultHandler: resultHandler)
	}

	func initializeAuthController(platformKeyRequest: ASAuthorizationRequest)
		-> ASAuthorizationController
	{
		return ASAuthorizationController(authorizationRequests: [platformKeyRequest]
		)
	}

	@objc
	public func getIsPasskeySupported() -> NSNumber {
		if #available(iOS 15.0, *) {
			return true
		}
		return false
	}
}
