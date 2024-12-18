import {
	PasskeyCreateOptionsJson,
	PasskeyCreateResultJson,
	PasskeyGetOptionsJson,
	PasskeyGetResultJson,
	PkcWithAuthenticatorAssertionResponse,
	PkcWithAuthenticatorAttestationResponse,
} from '../src/client/utils/passkey/types';

// device tracking mock device data
export const mockDeviceArray = [
	{
		DeviceAttributes: [
			{
				Name: 'device_status',
				Value: 'valid',
			},
			{
				Name: 'device_name',
				Value:
					'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.106 Safari/537.36',
			},
			{
				Name: 'last_ip_used',
				Value: '45.17.45.126',
			},
		],
		DeviceCreateDate: 1623956729.32,
		DeviceKey: 'us-east-2_596db07d-793a-4070-8140-27f321ccf01c',
		DeviceLastAuthenticatedDate: 1623956729,
		DeviceLastModifiedDate: 1623956730.312,
	},
	{
		DeviceAttributes: [
			{
				Name: 'device_status',
				Value: 'valid',
			},
			{
				Name: 'device_name',
				Value:
					'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.106 Safari/537.36',
			},
			{
				Name: 'last_ip_used',
				Value: '45.17.45.126',
			},
		],
		DeviceCreateDate: 1623956945.271,
		DeviceKey: 'us-east-2_12ac778f-52a4-4fca-a628-237776159c91',
		DeviceLastAuthenticatedDate: 1623956945,
		DeviceLastModifiedDate: 1623956945.904,
	},
	{
		DeviceAttributes: [
			{
				Name: 'device_status',
				Value: 'valid',
			},
			{
				Name: 'device_name',
				Value:
					'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.101 Safari/537.36',
			},
			{
				Name: 'last_ip_used',
				Value: '45.17.45.126',
			},
		],
		DeviceCreateDate: 1623957888.742,
		DeviceKey: 'us-east-2_4a93aeb3-01af-42d8-891d-ee8aa1549398',
		DeviceLastAuthenticatedDate: 1623963456,
		DeviceLastModifiedDate: 1623963457.705,
	},
	{
		DeviceAttributes: [
			{
				Name: 'device_status',
				Value: 'valid',
			},
			{
				Name: 'device_name',
				Value:
					'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.106 Safari/537.36',
			},
			{
				Name: 'last_ip_used',
				Value: '45.17.45.126',
			},
		],
		DeviceCreateDate: 1623957198.984,
		DeviceKey: 'us-east-2_e0019223-e6b8-453f-a4e7-4e0d69dd4316',
		DeviceLastAuthenticatedDate: 1623957198,
		DeviceLastModifiedDate: 1623957199.861,
	},
	{
		DeviceAttributes: [
			{
				Name: 'device_status',
				Value: 'valid',
			},
			{
				Name: 'device_name',
				Value:
					'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.106 Safari/537.36',
			},
			{
				Name: 'last_ip_used',
				Value: '45.17.45.126',
			},
		],
		DeviceCreateDate: 1623954284.74,
		DeviceKey: 'us-east-2_1763f940-7136-4133-8cf5-eb073cad06c9',
		DeviceLastAuthenticatedDate: 1623954284,
		DeviceLastModifiedDate: 1623954285.339,
	},
	{
		DeviceAttributes: [
			{
				Name: 'device_status',
				Value: 'valid',
			},
			{
				Name: 'device_name',
				Value: 'react-native',
			},
			{
				Name: 'last_ip_used',
				Value: '45.17.45.126',
			},
		],
		DeviceCreateDate: 1623954284.75,
		DeviceKey: 'us-west-2_80ede80b-f333-49cd-af42-0ad22d8de9d4',
		DeviceLastAuthenticatedDate: 1623954285,
		DeviceLastModifiedDate: 1623954285.34,
	},
];

export const transformedMockData = [
	{
		id: 'us-east-2_596db07d-793a-4070-8140-27f321ccf01c',
		name: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.106 Safari/537.36',
	},
	{
		id: 'us-east-2_12ac778f-52a4-4fca-a628-237776159c91',
		name: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.106 Safari/537.36',
	},
	{
		id: 'us-east-2_4a93aeb3-01af-42d8-891d-ee8aa1549398',
		name: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.101 Safari/537.36',
	},
	{
		id: 'us-east-2_e0019223-e6b8-453f-a4e7-4e0d69dd4316',
		name: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.106 Safari/537.36',
	},
	{
		id: 'us-east-2_1763f940-7136-4133-8cf5-eb073cad06c9',
		name: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.106 Safari/537.36',
	},
	{
		id: 'us-west-2_80ede80b-f333-49cd-af42-0ad22d8de9d4',
		name: 'react-native',
	},
];

export const mockAuthConfigWithOAuth = {
	Auth: {
		Cognito: {
			identityPoolId: 'identityPoolId',
			userPoolClientId: 'userPoolClientId',
			userPoolId: 'userPoolId',
			loginWith: {
				username: true,
				oauth: {
					domain: 'oauth.domain.com',
					scopes: [
						'phone' as const,
						'email' as const,
						'openid' as const,
						'profile' as const,
						'aws.cognito.signin.user.admin' as const,
					],
					redirectSignIn: ['http://localhost:3000/'],
					redirectSignOut: ['http://localhost:3000/'],
					responseType: 'code' as const,
					providers: ['Google' as const],
				},
			},
		},
	},
};

export const passkeyCredentialCreateOptions = {
	rp: { id: 'localhost', name: 'localhost' },
	user: {
		id: 'M2M0NjMyMGItYzYwZS00YTIxLTlkNjQtNTgyOWJmZWRlMWM0',
		name: 'james',
		displayName: '',
	},
	challenge: 'zsBch6DlNLUb6SgRdzHysw',
	pubKeyCredParams: [
		{ type: 'public-key', alg: -7 },
		{ type: 'public-key', alg: -257 },
	],
	timeout: 60000,
	excludeCredentials: [
		{
			type: 'public-key',
			id: 'VWxodmRFMUtjbEJZVWs1NE9IaHhOblZUTTBsUVJWSXRTbWhhUkdwZldHaDBSbVpmUmxKamFWRm5XUQ',
		},
		{
			type: 'public-key',
			id: 'WDJnM1RrMWxaSGc0Y1ZWQmVsOTVTRXRvWjBoME56UlFNbFZ5VkZWZmNXTkNORjlVYjFWTWVqRXlUUQ',
		},
	],
	authenticatorSelection: {
		requireResidentKey: true,
		residentKey: 'required',
		userVerification: 'required',
	},
};

export const passkeyRegistrationResultJson: PasskeyCreateResultJson = {
	type: 'public-key',
	id: 'vJCit9S2cglAvvW3txQ-OWRBb-NyhxaLOvRRisnr1aE',
	rawId: 'vJCit9S2cglAvvW3txQ-OQ',
	clientExtensionResults: {},
	response: {
		clientDataJSON: 'vJCit9S2cglAvvW3txQ-OQ',
		attestationObject: 'vJCit9S2cglAvvW3txQ-OQ',
		transports: ['internal'],
		publicKeyAlgorithm: -7,
		authenticatorData: 'vJCit9S2cglAvvW3txQ-OQ',
		publicKey: 'vJCit9S2cglAvvW3txQ-OQ',
	},
	authenticatorAttachment: 'platform',
};
export const passkeyRegistrationResult: PkcWithAuthenticatorAttestationResponse =
	{
		type: 'public-key',
		id: 'vJCit9S2cglAvvW3txQ-OWRBb-NyhxaLOvRRisnr1aE',
		rawId: new Uint8Array([
			188, 144, 162, 183, 212, 182, 114, 9, 64, 190, 245, 183, 183, 20, 62, 57,
		]),
		getClientExtensionResults: () => ({}),
		authenticatorAttachment: 'platform',
		response: {
			clientDataJSON: new Uint8Array([
				188, 144, 162, 183, 212, 182, 114, 9, 64, 190, 245, 183, 183, 20, 62,
				57,
			]),
			attestationObject: new Uint8Array([
				188, 144, 162, 183, 212, 182, 114, 9, 64, 190, 245, 183, 183, 20, 62,
				57,
			]),
			getPublicKey: () =>
				new Uint8Array([
					188, 144, 162, 183, 212, 182, 114, 9, 64, 190, 245, 183, 183, 20, 62,
					57,
				]),
			getPublicKeyAlgorithm: () => -7,
			getAuthenticatorData: () =>
				new Uint8Array([
					188, 144, 162, 183, 212, 182, 114, 9, 64, 190, 245, 183, 183, 20, 62,
					57,
				]),
			getTransports: () => ['internal'],
		},
	};

export const passkeyRegistrationRequest: PublicKeyCredentialCreationOptions = {
	rp: { id: 'localhost', name: 'localhost' },
	user: {
		id: new Uint8Array([
			188, 144, 162, 183, 212, 182, 114, 9, 64, 190, 245, 183, 183, 20, 62, 57,
		]),
		name: 'james',
		displayName: '',
	},
	challenge: new Uint8Array([
		188, 144, 162, 183, 212, 182, 114, 9, 64, 190, 245, 183, 183, 20, 62, 57,
	]),
	pubKeyCredParams: [
		{ type: 'public-key' as any, alg: -7 },
		{ type: 'public-key' as any, alg: -257 },
	],
	timeout: 60000,
	excludeCredentials: [
		{
			type: 'public-key' as any,
			id: new Uint8Array([
				188, 144, 162, 183, 212, 182, 114, 9, 64, 190, 245, 183, 183, 20, 62,
				57,
			]),
		},
	],
	authenticatorSelection: {
		requireResidentKey: true,
		residentKey: 'required' as any,
		userVerification: 'required' as any,
	},
};

export const passkeyRegistrationRequestJson: PasskeyCreateOptionsJson = {
	rp: { id: 'localhost', name: 'localhost' },
	user: {
		id: 'vJCit9S2cglAvvW3txQ-OQ',
		name: 'james',
		displayName: '',
	},
	challenge: 'vJCit9S2cglAvvW3txQ-OQ',
	pubKeyCredParams: [
		{ type: 'public-key', alg: -7 },
		{ type: 'public-key', alg: -257 },
	],
	timeout: 60000,
	excludeCredentials: [
		{
			type: 'public-key',
			id: 'vJCit9S2cglAvvW3txQ-OQ',
		},
	],
	authenticatorSelection: {
		requireResidentKey: true,
		residentKey: 'required',
		userVerification: 'required',
	},
};

export const passkeyCredentialRequestOptions =
	'{"hints":[],"attestation":"none","attestationFormats":[],"challenge":"9DAxgg4vPiaxvAxc-JbMuw","timeout":180000,"rpId":"localhost","allowCredentials":[{"id":"1oG8PrTycHFuWdHAjIelCnsVx7XsrGIL44Whwr_8F8k","type":"public-key"}],"userVerification":"required"}';

export const passkeyGetOptionsJson: PasskeyGetOptionsJson = {
	challenge: 'vJCit9S2cglAvvW3txQ-OQ',
	rpId: 'localhost',
	timeout: 180000,
	allowCredentials: [
		{
			id: 'vJCit9S2cglAvvW3txQ-OQ',
			type: 'public-key',
		},
	],
	userVerification: 'required',
};

export const passkeyGetOptions: PublicKeyCredentialRequestOptions = {
	challenge: new Uint8Array([
		188, 144, 162, 183, 212, 182, 114, 9, 64, 190, 245, 183, 183, 20, 62, 57,
	]),
	rpId: 'localhost',
	timeout: 180000,
	allowCredentials: [
		{
			id: new Uint8Array([
				188, 144, 162, 183, 212, 182, 114, 9, 64, 190, 245, 183, 183, 20, 62,
				57,
			]),
			type: 'public-key',
		},
	],
	userVerification: 'required',
};

export const passkeyGetResultJson: PasskeyGetResultJson = {
	id: 'vJCit9S2cglAvvW3txQ-OQ',
	rawId: 'vJCit9S2cglAvvW3txQ-OQ',
	type: 'public-key',
	clientExtensionResults: {},
	response: {
		clientDataJSON: 'vJCit9S2cglAvvW3txQ-OQ',
		authenticatorData: 'vJCit9S2cglAvvW3txQ-OQ',
		signature: 'vJCit9S2cglAvvW3txQ-OQ',
		userHandle: 'vJCit9S2cglAvvW3txQ-OQ',
	},
	authenticatorAttachment: 'platform',
};

export const passkeyGetResult: PkcWithAuthenticatorAssertionResponse = {
	type: 'public-key',
	id: 'vJCit9S2cglAvvW3txQ-OQ',
	rawId: new Uint8Array([
		188, 144, 162, 183, 212, 182, 114, 9, 64, 190, 245, 183, 183, 20, 62, 57,
	]),
	getClientExtensionResults: () => ({}),
	authenticatorAttachment: 'platform',
	response: {
		authenticatorData: new Uint8Array([
			188, 144, 162, 183, 212, 182, 114, 9, 64, 190, 245, 183, 183, 20, 62, 57,
		]),
		clientDataJSON: new Uint8Array([
			188, 144, 162, 183, 212, 182, 114, 9, 64, 190, 245, 183, 183, 20, 62, 57,
		]),
		signature: new Uint8Array([
			188, 144, 162, 183, 212, 182, 114, 9, 64, 190, 245, 183, 183, 20, 62, 57,
		]),
		userHandle: new Uint8Array([
			188, 144, 162, 183, 212, 182, 114, 9, 64, 190, 245, 183, 183, 20, 62, 57,
		]),
	},
};

export const mockUserCredentials = [
	{
		CredentialId: '12345',
		FriendlyCredentialName: 'mycred',
		RelyingPartyId: '11111',
		AuthenticatorAttachment: 'platform',
		AuthenticatorTransports: ['usb', 'nfc'],
		CreatedAt: 1709169825,
	},
	{
		CredentialId: '22345',
		FriendlyCredentialName: 'mycred2',
		RelyingPartyId: '11111',
		AuthenticatorAttachment: 'platform',
		AuthenticatorTransports: ['usb', 'nfc'],
		CreatedAt: 1582939425,
	},
];
