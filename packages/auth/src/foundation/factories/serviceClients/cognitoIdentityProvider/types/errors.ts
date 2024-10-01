// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export enum GetWebAuthnRegistrationOptionsException {
	ForbiddenException = 'ForbiddenException',
	InternalErrorException = 'InternalErrorException',
	InvalidParameterException = 'InvalidParameterException',
	InvalidWebAuthnConfigurationException = 'InvalidWebAuthnConfigurationException',
	LimitExceededException = 'LimitExceededException',
	NotAuthorizedException = 'NotAuthorizedException',
	TooManyRequestsException = 'TooManyRequestsException',
	WebAuthnNotEnabledException = 'WebAuthnNotEnabledException',
}

export enum VerifyWebAuthnRegistrationResultException {
	CredentialAlreadyExistsException = 'CredentialAlreadyExistsException',
	ForbiddenException = 'ForbiddenException',
	InternalErrorException = 'InternalErrorException',
	InvalidParameterException = 'InvalidParameterException',
	NotAuthorizedException = 'NotAuthorizedException',
	TooManyRequestsException = 'TooManyRequestsException',
	WebAuthnAuthenticatorSelectionMismatchException = 'WebAuthnAuthenticatorSelectionMismatchException',
	WebAuthnChallengeMismatchException = 'WebAuthnChallengeMismatchException',
	WebAuthnRelyingPartyMismatchException = 'WebAuthnRelyingPartyMismatchException',
}
