// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export enum StartWebAuthnRegistrationException {
	ForbiddenException = 'ForbiddenException',
	InternalErrorException = 'InternalErrorException',
	InvalidParameterException = 'InvalidParameterException',
	LimitExceededException = 'LimitExceededException',
	NotAuthorizedException = 'NotAuthorizedException',
	TooManyRequestsException = 'TooManyRequestsException',
	WebAuthnNotEnabledException = 'WebAuthnNotEnabledException',
	WebAuthnConfigurationMissingException = 'WebAuthnConfigurationMissingException',
}

export enum CompleteWebAuthnRegistrationException {
	ForbiddenException = 'ForbiddenException',
	InternalErrorException = 'InternalErrorException',
	InvalidParameterException = 'InvalidParameterException',
	LimitExceededException = 'LimitExceededException',
	NotAuthorizedException = 'NotAuthorizedException',
	TooManyRequestsException = 'TooManyRequestsException',
	WebAuthnNotEnabledException = 'WebAuthnNotEnabledException',
	WebAuthnChallengeNotFoundException = 'WebAuthnChallengeNotFoundException',
	WebAuthnRelyingPartyMismatchException = 'WebAuthnRelyingPartyMismatchException',
	WebAuthnClientMismatchException = 'WebAuthnClientMismatchException',
	WebAuthnOriginNotAllowedException = 'WebAuthnOriginNotAllowedException',
	WebAuthnCredentialNotSupportedException = 'WebAuthnCredentialNotSupportedException',
}

export enum ListWebAuthnCredentialsException {
	ForbiddenException = 'ForbiddenException',
	InternalErrorException = 'InternalErrorException',
	InvalidParameterException = 'InvalidParameterException',
	NotAuthorizedException = 'NotAuthorizedException',
}

export enum DeleteWebAuthnCredentialException {
	ForbiddenException = 'ForbiddenException',
	InternalErrorException = 'InternalErrorException',
	InvalidParameterException = 'InvalidParameterException',
	NotAuthorizedException = 'NotAuthorizedException',
	ResourceNotFoundException = 'ResourceNotFoundException',
}
