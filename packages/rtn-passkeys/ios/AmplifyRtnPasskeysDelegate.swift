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

	let _resultHandler: AmplifyRtnPasskeysResultHandler

	init(resultHandler: AmplifyRtnPasskeysResultHandler) {
		_resultHandler = resultHandler
	}

	func performAuthForController(_ authController: ASAuthorizationController) {
		authController.delegate = self
		authController.presentationContextProvider = self
		authController.performRequests()
	}

	func authorizationController(
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

			_resultHandler.handleSuccess(assertionResult)

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

			_resultHandler.handleSuccess(registrationResult)

		default:
			_resultHandler.handleError(
				errorName: "FAILED", errorMessage: nil, error: nil)
		}
	}

	func authorizationController(
		controller: ASAuthorizationController,
		didCompleteWithError error: any Error
	) {
		let errorMessage = error.localizedDescription

		var errorName =
			AmplifyRtnPasskeysDelegate.ERROR_MAP[(error as NSError).code] ?? "UNKNOWN"

		// pre-iOS 18 does not through explicit error for duplicate
		if errorMessage.contains(
			"credential matches an entry of the excludeCredentials list")
		{
			errorName = "DUPLICATE"
		}

		// no explicit error with for SecurityError
		if errorMessage.contains("not associated with domain") {
			errorName = "RELYING_PARTY_MISMATCH"
		}

		_resultHandler.handleError(
			errorName: errorName, errorMessage: errorMessage, error: error)
	}

	func presentationAnchor(for controller: ASAuthorizationController)
		-> ASPresentationAnchor
	{
		return ASPresentationAnchor()
	}
}
