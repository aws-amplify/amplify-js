// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import AuthenticationServices
import Foundation

@objc(AmplifyRtnPasskeysHelper)
public class AmplifyRtnPasskeysHelper: NSObject, AmplifyRtnPasskeysResultHandler
{
	private var delegate: AmplifyRtnPasskeysDelegate?
	private var handler: AmplifyRtnPasskeysHandler?

	// MARK: - AmplifyRtnPasskeysHelper.createPasskey
	@objc
	@available(iOS 17.4, *)
	public func createPasskey(
		_ rpId: String,
		userId: String,
		userName: String,
		challenge: String,
		excludeCredentials: [String],
		resolve: @escaping RCTPromiseResolveBlock,
		reject: @escaping RCTPromiseRejectBlock
	) {

		handler = AmplifyRtnPasskeysHandler(resolve, reject)

		let platformProvider = ASAuthorizationPlatformPublicKeyCredentialProvider(
			relyingPartyIdentifier: rpId)

		let platformKeyRequest =
			platformProvider.createCredentialRegistrationRequest(
				challenge: challenge.toBase64UrlDecodedData(),
				name: userName,
				userID: userId.toBase64UrlDecodedData()
			)

		let excludedCredentials:
			[ASAuthorizationPlatformPublicKeyCredentialDescriptor] =
				excludeCredentials.compactMap { credentialId in
					return .init(credentialID: credentialId.toBase64UrlDecodedData())
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
	
	// MARK: - AmplifyRtnPasskeysHelper.getPasskey
	@objc
	@available(iOS 17.4, *)
	public func getPasskey(
		_ rpId: String,
		challenge: String,
		userVerification: String,
		allowCredentials: [String],
		resolve: @escaping RCTPromiseResolveBlock,
		reject: @escaping RCTPromiseRejectBlock
	) {

		handler = AmplifyRtnPasskeysHandler(resolve, reject)

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
