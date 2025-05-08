// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import AuthenticationServices
import Foundation

class AmplifyRtnPasskeysDelegate: NSObject,
	ASAuthorizationControllerDelegate,
	ASAuthorizationControllerPresentationContextProviding
{
	private static let PUBLIC_KEY_TYPE = "public-key"
	private static let PLATFORM_ATTACHMENT = "platform"
	private static let INTERNAL_TRANSPORT = "internal"

	private static let ERROR_MAP: [Int: String] = [
		1000: "UNKNOWN",
		1001: "CANCELED",
		1002: "INVALID_RESPONSE",
		1003: "NOT_HANDLED",
		1004: "FAILED",
		1005: "NOT_INTERACTIVE",
		1006: "DUPLICATE",
	]

	private let _handler: AmplifyRtnPasskeysResultHandler

	init(handler: AmplifyRtnPasskeysResultHandler) {
		_handler = handler
	}

	// MARK: - ASAuthorizationControllerDelegate
	public func authorizationController(
		controller: ASAuthorizationController,
		didCompleteWithAuthorization authorization: ASAuthorization
	) {

		switch authorization.credential {
		case let assertionCredential
			as ASAuthorizationPlatformPublicKeyCredentialAssertion:

			let assertionResult: NSDictionary = [
				"id": assertionCredential.credentialID.toBase64UrlEncodedString(),
				"rawId": assertionCredential.credentialID.toBase64UrlEncodedString(),
				"authenticatorAttachment": AmplifyRtnPasskeysDelegate
					.PLATFORM_ATTACHMENT,
				"type": AmplifyRtnPasskeysDelegate.PUBLIC_KEY_TYPE,
				"response": [
					"authenticatorData": assertionCredential.rawAuthenticatorData
						.toBase64UrlEncodedString(),
					"clientDataJSON": assertionCredential.rawClientDataJSON
						.toBase64UrlEncodedString(),
					"signature": assertionCredential.signature.toBase64UrlEncodedString(),
					"userHandle": assertionCredential.userID.toBase64UrlEncodedString(),
				],
			]

			_handler.handleSuccess(assertionResult)

		case let registrationCredential
			as ASAuthorizationPlatformPublicKeyCredentialRegistration:
			let registrationResult: NSDictionary = [
				"id": registrationCredential.credentialID.toBase64UrlEncodedString(),
				"rawId": registrationCredential.credentialID.toBase64UrlEncodedString(),
				"authenticatorAttachment": AmplifyRtnPasskeysDelegate
					.PLATFORM_ATTACHMENT,
				"type": AmplifyRtnPasskeysDelegate.PUBLIC_KEY_TYPE,
				"response": [
					"attestationObject": registrationCredential.rawAttestationObject!
						.toBase64UrlEncodedString(),
					"clientDataJSON": registrationCredential.rawClientDataJSON
						.toBase64UrlEncodedString(),
					"transports": [AmplifyRtnPasskeysDelegate.INTERNAL_TRANSPORT],
				],
			]

			_handler.handleSuccess(registrationResult)

		default:
			_handler.handleError(errorName: "FAILED", errorMessage: nil, error: nil)
		}
	}

	public func authorizationController(
		controller: ASAuthorizationController,
		didCompleteWithError error: any Error
	) {
		let errorMessage = error.localizedDescription
		
		var errorName =
			AmplifyRtnPasskeysDelegate.ERROR_MAP[(error as NSError).code] ?? "UNKNOWN"

		if errorMessage.contains(
			"credential matches an entry of the excludeCredentials list")
		{
			errorName = "DUPLICATE"
		}

		if errorMessage.contains("not associated with domain") {
			errorName = "RELYING_PARTY_MISMATCH"
		}

		_handler.handleError(
			errorName: errorName, errorMessage: errorMessage, error: error)
	}

	// MARK: - ASAuthorizationControllerPresentationContextProviding
	func presentationAnchor(for controller: ASAuthorizationController)
		-> ASPresentationAnchor
	{
		return ASPresentationAnchor()
	}
}

// MARK: - Data Extension
extension Data {
	fileprivate func toBase64UrlEncodedString() -> String {
		return self.base64EncodedString()
			.replacingOccurrences(of: "/", with: "_")
			.replacingOccurrences(of: "+", with: "-")
			.replacingOccurrences(of: "=", with: "")
	}
}
