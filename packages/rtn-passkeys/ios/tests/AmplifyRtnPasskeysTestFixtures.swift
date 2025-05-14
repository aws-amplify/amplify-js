// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import AuthenticationServices
import Foundation

struct TestFixtures {
	// AmplifyRtnPasskeysHelpersTests
	static let base64String = "PDw/Pz8+Pg=="
	static let base64UrlString = "PDw_Pz8-Pg"
	
	// AmplifyRtnPasskeysTests
	static let validRpId = "example.com"
	static let validChallenge = "Y2hhbGxlbmdlLXZhbHVl"
	static let invalidChallenge = "invalid-challenge"

	static let validUserId = "dXNlci1pZC12YWx1ZQ=="
	static let validUserName = "testuser@example.com"

	static let validExcludeCredentials = [
		"Y3JlZGVudGlhbC1pZC0x",
		"Y3JlZGVudGlhbC1pZC0y",
	]

	static let validUserVerificationRequired = "required"

	static let validAllowCredentials = [
		"Y3JlZGVudGlhbC1pZC0x",
		"Y3JlZGVudGlhbC1pZC0y",
	]

	// Mock successful createPasskey result
	static func createPasskeySuccess() -> NSDictionary {
		return [
			"id": "Y3JlZGVudGlhbC1pZC1uZXc=",  // Base64URL encoded "credential-id-new"
			"rawId": "Y3JlZGVudGlhbC1pZC1uZXc=",
			"type": "public-key",
			"authenticatorAttachment": "platform",
			"response": [
				"clientDataJSON":
					"eyJ0eXBlIjoid2ViYXV0aG4uY3JlYXRlIiwiY2hhbGxlbmdlIjoiWTJoaGJHeGxibWRsTFhaaGJIVmwiLCJvcmlnaW4iOiJodHRwczovL2V4YW1wbGUuY29tIn0=",
				"attestationObject": "bzJoZWxsb3dvcmxkZw==",
				"transports": ["internal"],
			],
		]
	}

	static func getPasskeySuccess() -> NSDictionary {
		return [
			"id": "Y3JlZGVudGlhbC1pZC0x",
			"rawId": "Y3JlZGVudGlhbC1pZC0x",
			"type": "public-key",
			"authenticatorAttachment": "platform",
			"response": [
				"authenticatorData":
					"SZYN5YgOjGh0NBcPZHZgW4/krrmihjLHmVzzuoMdl2MBAAAACA==",
				"clientDataJSON":
					"eyJ0eXBlIjoid2ViYXV0aG4uZ2V0IiwiY2hhbGxlbmdlIjoiWTJoaGJHeGxibWRsTFhaaGJIVmwiLCJvcmlnaW4iOiJodHRwczovL2V4YW1wbGUuY29tIn0=",
				"signature":
					"MEUCIQDxvUz+tIFPrWWRtJJbYHFHNmWdRYPi0EvCEiN+aXiOQQIgEfXxDHbH0q8+htk7qacVFniQKz85KYQMz3HEPDC9hok=",
				"userHandle": "dXNlci1pZC12YWx1ZQ==",
			],
		]

	}
}
