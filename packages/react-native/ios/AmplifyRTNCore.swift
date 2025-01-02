// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import AuthenticationServices

#if canImport(UIKit)
	import UIKit
#else
	import Foundation
#endif

@objc(AmplifyRTNCore)
class AmplifyRTNCore: NSObject {
	var passkeyHandler: RTNPasskeyHandler?

	@objc(multiply:withB:withResolver:withRejecter:)
	func multiply(
		a: Float, b: Float,
		resolve: RCTPromiseResolveBlock,
		reject _: RCTPromiseRejectBlock
	) {
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
	func getDeviceName(
		resolve: @escaping RCTPromiseResolveBlock,
		reject _: @escaping RCTPromiseRejectBlock
	) {
		var deviceName: String
		#if canImport(UIKit)
			deviceName = UIDevice.current.name
		#else
			deviceName = ProcessInfo.processInfo.hostName
		#endif
		resolve(deviceName)
	}

	@available(iOS 15.0, *)
	@objc(createPasskey:withResolver:withRejecter:)
	func createPasskey(
		_ request: String,
		resolve: @escaping RCTPromiseResolveBlock,
		reject: @escaping RCTPromiseRejectBlock
	) {

		do {
			passkeyHandler = RTNPasskeyHandler(resolve, reject)

			let requestData = request.data(using: String.Encoding.utf8)!
			let requestJson: CreatePasskeyOptions = try JSONDecoder().decode(
				CreatePasskeyOptions.self, from: requestData)

			let platformProvider = ASAuthorizationPlatformPublicKeyCredentialProvider(
				relyingPartyIdentifier: requestJson.rp.id)

			let platformKeyRequest = platformProvider.createCredentialRegistrationRequest(
				challenge: requestJson.challenge.decodeBase64Url()!,
				name: requestJson.user.name,
				userID: requestJson.user.id.decodeBase64Url()!
			)

			let authController = ASAuthorizationController(authorizationRequests: [
				platformKeyRequest
			])

			authController.delegate = self
			authController.presentationContextProvider = self
			authController.performRequests()
		} catch let error as NSError {
			reject(error.debugDescription, "create passkey error", nil)
		}

	}

	@available(iOS 15.0, *)
	@objc(getPasskey:withResolver:withRejecter:)
	func getPasskey(
		_ request: String,
		resolve: @escaping RCTPromiseResolveBlock,
		reject: @escaping RCTPromiseRejectBlock
	) {
		do {
			passkeyHandler = RTNPasskeyHandler(resolve, reject)

			let requestData = request.data(using: .utf8)!
			let requestJson = try JSONDecoder().decode(GetPasskeyOptions.self, from: requestData)

			let platformProvider = ASAuthorizationPlatformPublicKeyCredentialProvider(
				relyingPartyIdentifier: requestJson.rpId)

			let platformKeyRequest = platformProvider.createCredentialAssertionRequest(
				challenge: requestJson.challenge.decodeBase64Url()!)

			let authController = ASAuthorizationController(authorizationRequests: [
				platformKeyRequest
			])

			authController.delegate = self
			authController.presentationContextProvider = self
			authController.performRequests()
		} catch let error as NSError {
			reject(error.debugDescription, "get passkey error", nil)
		}
	}
}

@available(iOS 15.0, *)
extension AmplifyRTNCore: ASAuthorizationControllerDelegate {
	func authorizationController(
		controller: ASAuthorizationController,
		didCompleteWithAuthorization authorization: ASAuthorization
	) {
		guard let handler = passkeyHandler else {
			print("no handler 1")
			return
		}

		do {
			switch authorization.credential {
			case let credential as ASAuthorizationPlatformPublicKeyCredentialRegistration:
				let createResult: NSDictionary = [
					"id": credential.credentialID.toBase64Url(),
					"rawId": credential.credentialID.toBase64Url(),
					"type": "public-key",
					"response": [
						"attestationObject": credential.rawAttestationObject!
							.toBase64Url(),
						"clientDataJSON": credential.rawClientDataJSON.toBase64Url(),
						"transports": ["internal"],
					],
					"authenticatorAttachment": "platform",
				]

				let jsonData = try JSONSerialization.data(withJSONObject: createResult)

				if let jsonString = String(data: jsonData, encoding: .utf8) {
					handler.resolve(jsonString)
				}
			case let credential as ASAuthorizationPlatformPublicKeyCredentialAssertion:
				let getResult: NSDictionary = [
					"id": credential.credentialID.toBase64Url(),
					"rawId": credential.credentialID.toBase64Url(),
					"type": "public-key",
					"response": [
						"authenticatorData": credential.rawAuthenticatorData
							.toBase64Url(),
						"clientDataJSON": credential.rawClientDataJSON.toBase64Url(),
						"signature": credential.signature.toBase64Url(),
					],
					"authenticatorAttachment": "platform",
				]
				let jsonData = try JSONSerialization.data(withJSONObject: getResult)

				if let jsonString = String(data: jsonData, encoding: .utf8) {
					handler.resolve(jsonString)
				}
			default:
				handler.reject("ERROR", "not a valid credential type", nil)
			}
		} catch let error as NSError {
			handler.reject("ERROR", "error in authorization controller", nil)
		}
	}
	func authorizationController(
		controller: ASAuthorizationController,
		didCompleteWithError error: any Error
	) {
		guard let handler = passkeyHandler else {
			print("no handler 2")
			return
		}
		handler.reject("ERROR", "An unexpected error occurred", nil)
	}
}

@available(iOS 15.0, *)
extension AmplifyRTNCore: ASAuthorizationControllerPresentationContextProviding {
	func presentationAnchor(for controller: ASAuthorizationController) -> ASPresentationAnchor {
		return ASPresentationAnchor()
	}
}

@available(iOS 15.0, *)
struct CreatePasskeyOptions: Decodable {
	let challenge: String
	struct RelyingParty: Decodable {
		let id: String
	}
	struct User: Decodable {
		let id: String
		let name: String
	}

	let user: User
	let rp: RelyingParty

}

struct GetPasskeyOptions: Decodable {
	let challenge: String
	let rpId: String
}

struct RTNPasskeyHandler {
	var resolve: RCTPromiseResolveBlock
	var reject: RCTPromiseRejectBlock

	init(
		_ resolve: @escaping RCTPromiseResolveBlock,
		_ reject: @escaping RCTPromiseRejectBlock
	) {
		self.resolve = resolve
		self.reject = reject
	}
}

@available(iOS 15.0, *)
extension Data {
	fileprivate func toBase64Url() -> String {
		return self.base64EncodedString()
			.replacingOccurrences(of: "+", with: "-")
			.replacingOccurrences(of: "/", with: "_")
			.replacingOccurrences(of: "=", with: "")
	}
}

@available(iOS 15.0, *)
extension String {
	fileprivate func decodeBase64Url() -> Data? {
		var base64 =
			self
			.replacingOccurrences(of: "-", with: "+")
			.replacingOccurrences(of: "_", with: "/")
		if base64.count % 4 != 0 {
			base64.append(String(repeating: "=", count: 4 - base64.count % 4))
		}

		return Data(base64Encoded: base64)
	}
}
